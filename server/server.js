import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import dbConfig from './dbConfig.js'; 
// import multer from 'multer';
// import zlib from 'zlib';

// Configure multer for in-memory file storage
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10 MB
// });

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release(); 
});


// get all tags
app.get("/test", (req, res) => {
  console.log('Fetching /test...');
  res.json({ message: 'Test data received!' }); // Example response


})

// get data (from eb_logs, net_orders,, ned products in JOIN)
// ..över beställningar utan poststämpel (net_orders.posted IS NULL) som skapades från och med 2024-05-01 (net_orders.inserted >= '2024-05-01') och som inte har uppdaterats på en vecka.
// .. För att se om en beställning inte har uppdateras på en vecka så kan man kolla eb_logs.updated. Beställningarna i listan skall inte vara postade (net_orders.posted IS NULL), inte makulerade (net_orders.cancelled IS NULL), inte markerade för "recopy" (eb_logs.qc_recopy IS NULL), (net_orders.pol_fixed IS NULL) och de skall ha ett pris (net_orders.baseprice > 0)
app.get("/api/alldata", (req, res) => {
  console.log('Fetching /alldata...');

    // Calculate the date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); 
    const formattedDate = oneWeekAgo.toISOString().split('T')[0]; 
    console.log(formattedDate);

  const getQuery = `
  SELECT 
      o.orderuuid,
      o.portaluuid, 
      o.paid,
      np.cnt, 
      o.inserted,
      o.originating,
      o.pol_flag,
      l.updated 
  FROM 
      eb_logs AS l 
  JOIN 
      net_orders AS o 
      ON o.orderuuid = l.orderuuid 
  LEFT JOIN (
      SELECT 
          orderuuid, 
          COUNT(id) AS cnt 
      FROM 
          net_products 
      WHERE 
          return_factor != 1 
      GROUP BY 
          orderuuid
  ) AS np 
      ON np.orderuuid = l.orderuuid 
  WHERE 
      l.qc_recopy IS NULL 
      AND o.posted IS NULL 
      AND o.baseprice > 0 
      AND o.cancelled IS NULL
      AND o.pol_fixed IS NULL 
      AND l.updated < ?
      AND o.inserted > '2024-05-01'  
  ORDER BY 
      l.inserted
`;

  db.query(getQuery, [formattedDate], (error, results) => {
    if (error) {
      console.error('SQL error:', error);
      return res.status(500).json({ error: 'An error occurred while fetching the alldata from eb_logs, net_orders & net_products.' });
    }
    const alldata = results.map(row => ({
        ...row
    }));
    res.status(200).json({ data: alldata, status: 200 });
  });
});



// POST route to set pol_flag in net_orders
app.post('/api/flag', (req, res) => {
    const { orderuuid } = req.body;
    console.log("Retrieved orderuuid: ", orderuuid);

    if (!orderuuid) {
        return res.status(400).json({ error: 'Orderuuid is required.' });
    }

    const updateFlagQuery = `
        UPDATE net_orders 
        SET pol_flag = NOW() 
        WHERE orderuuid IN (?)
    `

    db.query(updateFlagQuery, [orderuuid], (error, results) => {
        if (error) {
          console.error('SQL error:', error);
          return res.status(500).json({ error: 'An error occurred while setting the pol_flag in net_orders.', message: "Error", timestamp: currentTime, statuscode: 500, updated: orderuuid });
        }
        const currentTime = new Date().toLocaleTimeString();
        res.status(200).json({ updated: orderuuid, statuscode: 200, message: 'Flag set', timestamp: currentTime });
      });
})


// POST route to set pol_fixed in net_orders
app.post('/api/fixed', (req, res) => {
    const { orderuuid } = req.body;
    console.log("Retrieved orderuuid: ", orderuuid);

    if (!orderuuid) {
        return res.status(400).json({ error: 'Orderuuid is required.' });
    }

    const updateFixedQuery = `
        UPDATE net_orders 
        SET pol_fixed = NOW() 
        WHERE orderuuid IN (?)
    `

    db.query(updateFixedQuery, [orderuuid], (error, results) => {
        if (error) {
          console.error('SQL error:', error);
          return res.status(500).json({ error: 'An error occurred while setting the pol_fixed in net_orders.', message: "Error", timestamp: currentTime, statuscode: 500, updated: orderuuid });
        }
        const currentTime = new Date().toLocaleTimeString();
        res.status(200).json({ updated: orderuuid, statuscode: 200, message: 'Fixed set', timestamp: currentTime });
      });

})



// POST route to set cancelled in net_orders
app.post('/api/cancel', (req, res) => {
  const { orderuuid } = req.body;
  console.log("Retrieved orderuuid: ", orderuuid);

  if (!orderuuid) {
      return res.status(400).json({ error: 'Orderuuid is required.' });
  }

  const updateCancelQuery = `
      UPDATE net_orders 
      SET cancelled = NOW() 
      WHERE orderuuid IN (?)
  `

  db.query(updateCancelQuery, [orderuuid], (error, results) => {
      if (error) {
        console.error('SQL error:', error);
        return res.status(500).json({ error: 'An error occurred while setting cancellled in net_orders.', message: "Error", timestamp: currentTime, statuscode: 500, updated: orderuuid });
      }
      const currentTime = new Date().toLocaleTimeString();
      res.status(200).json({ updated: orderuuid, statuscode: 200, message: 'Cancelled set', timestamp: currentTime });
    });

})



// POST route to set post in net_orders
app.post('/api/post', (req, res) => {
  const { orderuuid } = req.body;
  console.log("Retrieved orderuuid: ", orderuuid);

  if (!orderuuid) {
      return res.status(400).json({ error: 'Orderuuid is required.' });
  }

  const updatePostQuery = `
      UPDATE net_orders 
      SET posted = NOW() 
      WHERE orderuuid IN (?)
  `

  db.query(updatePostQuery, [orderuuid], (error, results) => {
      if (error) {
        console.error('SQL error:', error);
        return res.status(500).json({ error: 'An error occurred while setting posted in net_orders.', message: "Error", timestamp: currentTime, statuscode: 500, updated: orderuuid });
      }
      const currentTime = new Date().toLocaleTimeString();
      res.status(200).json({ updated: orderuuid, statuscode: 200, message: 'Posted set', timestamp: currentTime });
    });

})



// // Route to get articles with details
// app.get('/api/articles', (req, res) => {
//   const query = `
//     SELECT 
//         a.id AS id,
//         a.title,
//         a.description,
//         a.created_at,
//         a.updated_at,
//         a.author,
//         a.deleted,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(tag) 
//              FROM kb_article_tags t 
//              WHERE t.article_id = a.id),
//             JSON_ARRAY()
//         ) AS tags,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(lang) 
//              FROM kb_article_langs l 
//              WHERE l.article_id = a.id),
//             JSON_ARRAY()
//         ) AS langs,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(
//                 JSON_OBJECT(
//                     'name', f.filename,
//                     'path', f.filepath,
//                     'created_at', f.created_at,
//                     'updated_at', f.updated_at
//                 )
//             ) 
//              FROM kb_article_files f 
//              WHERE f.article_id = a.id),
//             JSON_ARRAY()
//         ) AS files
//     FROM kb_articles a
//     WHERE a.deleted IS NULL
//     GROUP BY a.id;
//   `;
  
//   db.query(query, (error, results) => {
//     if (error) {
//       console.error('SQL error:', error);
//       return res.status(500).json({ error: 'An error occurred while fetching data.' });
//     }
//     const formattedResults = results.map(article => ({
//       ...article,
//       tags: JSON.parse(article.tags || '[]'), 
//       langs: JSON.parse(article.langs || '[]'),
//       files: JSON.parse(article.files || '[]'),
//     }));

//     res.json(formattedResults);
//   });
// });





// // Route to get articles with details : ID
// app.get('/api/articles/:id', (req, res) => {
//   const articleId = req.params.id;

//   const query = `
//     SELECT 
//         a.id AS id,
//         a.title,
//         a.description,
//         a.created_at,
//         a.updated_at,
//         a.author,
//         a.deleted,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(tag) 
//              FROM kb_article_tags t 
//              WHERE t.article_id = a.id),
//             JSON_ARRAY()
//         ) AS tags,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(lang) 
//              FROM kb_article_langs l 
//              WHERE l.article_id = a.id),
//             JSON_ARRAY()
//         ) AS langs,
//         COALESCE(
//             (SELECT JSON_ARRAYAGG(
//                 JSON_OBJECT(
//                     'name', f.filename,
//                     'path', f.filepath,
//                     'created_at', f.created_at,
//                     'updated_at', f.updated_at
//                 )
//             ) 
//              FROM kb_article_files f 
//              WHERE f.article_id = a.id),
//             JSON_ARRAY()
//         ) AS files
//     FROM kb_articles a
//     WHERE a.deleted IS NULL AND a.id = ?
//     GROUP BY a.id;
//   `;
  
//   db.query(query, [articleId], (error, results) => {
//     if (error) {
//       console.error('SQL error:', error);
//       return res.status(500).json({ error: 'An error occurred while fetching data.' });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Article not found.' });
//     }

//     const article = results[0];
//     const formattedResults = {
//       ...article,
//       tags: JSON.parse(article.tags || '[]'), 
//       langs: JSON.parse(article.langs || '[]'),
//       files: JSON.parse(article.files || '[]'),
//     };

//     res.json(formattedResults);
//   });
// });



// // Route to add a new article
// app.post('/api/articles', upload.array('files'), (req, res) => {
//   const { title, description, author, tags, langs } = req.body;
//   const files = req.files;

//   console.log('Files received:', files); 
//   console.log('Tags received:', tags); 

//   if (!title || !description || !tags || !langs) {
//     return res.status(400).json({ error: 'Title, description, tags and files are required.' });
//   }

//   const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
//   const langsArray = langs ? langs.split(',').map(lang => lang.trim()) : [];

//   const insertArticleQuery = `
//     INSERT INTO kb_articles (title, description, author, created_at)
//     VALUES (?, ?, ?, NOW());
//   `;
  
//   db.query(insertArticleQuery, [title, description, author], (error, results) => {
//     if (error) {
//       console.error('SQL error:', error); 
//       return res.status(500).json({ error: 'An error occurred while adding the article.' });
//     }

//     const articleId = results.insertId; 

//     // Insert tags
//     if (tagsArray.length > 0) {
//       const insertTagsQuery = 'INSERT INTO kb_article_tags (article_id, tag) VALUES ?';
//       const tagsValues = tagsArray.map(tag => [articleId, tag]);
//       db.query(insertTagsQuery, [tagsValues], (error) => {
//         if (error) {
//           console.error('SQL error:', error); 
//           return res.status(500).json({ error: 'An error occurred while adding tags.' });
//         }
//       });
//     }

//       // Insert languages
//       if (langsArray.length > 0) {
//         const insertLangsQuery = 'INSERT INTO kb_article_langs (article_id, lang) VALUES ?';
//         const langsValues = langsArray.map(lang => [articleId, lang]);
//         db.query(insertLangsQuery, [langsValues], (error) => {
//           if (error) {
//             console.error('SQL error:', error);
//             return res.status(500).json({ error: 'An error occurred while adding languages.' });
//           }
//         });
//       }

//       console.log("files sending to db", files);
//     // Insert files
//     if (files && files.length > 0) {
//       const insertFilesQuery = 'INSERT INTO kb_article_files (article_id, filename, filepath, created_at) VALUES ?';
//       const filesValues = files.map(file => [articleId, file.originalname, file.buffer.toString('base64'), new Date()]);
//       db.query(insertFilesQuery, [filesValues], (error) => {
//         if (error) {
//           console.error('SQL error:', error); 
//           return res.status(500).json({ error: 'An error occurred while adding files.' });
//         }
//       });
//     }

//     res.status(201).json({ message: 'Article added successfully.', articleId });
//   });
// });


// // Route to update an article
// app.put("/api/articles/:id", upload.array('uploadedFiles'), async (req, res) => {
//   const { title, description, tags, langs, deletedFiles, uploadedFiles } = req.body;
//   const articleId = req.params.id;
//   console.error("deletedFiles", deletedFiles);
//   console.error("uploadedFiles", uploadedFiles);
//   console.log("Type of deletedFiles:", typeof deletedFiles);
//   console.log("Is Array:", Array.isArray(deletedFiles));
  
//    // Parse JSON strings in `req.body`
//    const parsedDeletedFiles = JSON.parse(deletedFiles || '[]');

//    console.log("deletedFiles Parsed:", parsedDeletedFiles);
//    console.log("uploadedFiles", req.files);

//   if (!title || !description) {
//     return res.status(400).json({ error: 'Title and description are required.' });
//   }

//   try {
//     // Update the article
//     const updateArticleQuery = `
//       UPDATE kb_articles 
//       SET title = ?, description = ?, updated_at = NOW() 
//       WHERE id = ?;
//     `;
//     await executeQuery(updateArticleQuery, [title, description, articleId]);

//     // Handle tags
//     await updateTags(articleId, tags);

//     // Handle langs
//     const langsArray = JSON.parse(langs);
//     await updateLangs(articleId, langsArray);

//   // Handle deleted files
//   if (parsedDeletedFiles.length > 0) {
//     await deleteFiles(articleId, parsedDeletedFiles);
//   }

//   //  // Handle uploaded files
//   //  if (req.files && req.files.length > 0) {
//   //   await addFiles(articleId, req.files);
//   // }
//   // Handle uploaded files
//   if (req.files && req.files.length > 0) {
//     const result = await addFiles(articleId, req.files);
//     if (result.error) {
//       // Send error message for duplicates
//       return res.status(400).json({ error: result.error });
//     } 
//   }

//     // Success response
//     res.status(200).json({ message: 'Article, tags, and langs updated successfully.', status: 200 });
//   } catch (error) {
//     console.error('Error updating article:', error);  
//     res.status(500).json({ error: 'An error occurred while updating the article.' });
//   }
// });
// // Function to delete files
// const deleteFiles = async (articleId, deletedFiles) => {
//   if (deletedFiles.length === 0) {
//     console.log("No files to delete.");
//     return;
//   }
//   // Generate the correct number of placeholders for the SQL query
//   const placeholders = deletedFiles.map(() => '?').join(',');
//   const deleteFilesQuery = `DELETE FROM kb_article_files WHERE article_id = ? AND filename IN (${placeholders})`;

//   try {
//     await executeQuery(deleteFilesQuery, [articleId, ...deletedFiles]);
//   } catch (error) {
//     console.error('SQL error:', error);
//     throw new Error('An error occurred while deleting files.');
//   }
// };
// // Function to add new files
// // const addFiles = async (articleId, uploadedFiles) => {
// //   const insertFilesQuery = 'INSERT INTO kb_article_files (article_id, filename, filepath, created_at) VALUES ?';

// //   const fileValues = uploadedFiles.map(file => [
// //     articleId,
// //     file.originalname, 
// //     file.buffer.toString('base64'), 
// //     new Date() 
// //   ]);

// //   try {
// //     await executeQuery(insertFilesQuery, [fileValues]);
// //   } catch (error) {
// //     console.error('SQL error:', error);
// //     throw new Error('An error occurred while adding files.');
// //   }
// // };
// // Function to add new files
// const addFiles = async (articleId, uploadedFiles) => {
//   const filenames = uploadedFiles.map(file => file.originalname);

//   // Query to check for existing filenames
//   const placeholders = filenames.map(() => '?').join(',');
//   const checkExistingFilesQuery = `
//     SELECT filename 
//     FROM kb_article_files 
//     WHERE article_id = ? 
//     AND filename IN (${placeholders})
//   `;

//   try {
//     // Check for existing filenames
//     const existingFiles = await executeQuery(checkExistingFilesQuery, [articleId, ...filenames]);
//     const existingFilenames = existingFiles.map(file => file.filename);
//     console.log("existingFilenames", existingFilenames);

//     // Find duplicates
//     const duplicates = filenames.filter(filename => existingFilenames.includes(filename));
//     console.log("duplicates", duplicates);
//     if (existingFiles.length > 0 && duplicates.length > 0) {
//       return { status: 502, error: `Files already exists: ${duplicates.join(', ')}` };
//     }

//     // Prepare data for insertion
//     const insertFilesQuery = 'INSERT INTO kb_article_files (article_id, filename, filepath, created_at) VALUES ?';
//     const fileValues = uploadedFiles.map(file => [
//       articleId,
//       file.originalname, 
//       file.buffer.toString('base64'), 
//       new Date() 
//     ]);

//     // Insert new files
//     await executeQuery(insertFilesQuery, [fileValues]);
//     return { status: 200, message: 'Files added successfully.' };
  
//   } catch (error) {
//     console.error('Error in addFiles:', error);
//     throw new Error('An error occurred while adding files.');
//   }
// };
// // Helper function to execute database queries
// const executeQuery = (query, params) => {
//   return new Promise((resolve, reject) => {
//     db.query(query, params, (error, results) => {
//       if (error) {
//         console.error('SQL error:', error);
//         reject(error);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };
// // Function to update tags
// const updateTags = async (articleId, tags) => {
//   const tagsArray = tags.split(',').map(tag => tag.trim());
//   const deleteTagsQuery = 'DELETE FROM kb_article_tags WHERE article_id = ?';
//   await executeQuery(deleteTagsQuery, [articleId]);

//   if (tagsArray.length > 0) {
//     const insertTagsQuery = 'INSERT INTO kb_article_tags (article_id, tag) VALUES ?';
//     const tagsData = tagsArray.map(tag => [articleId, tag]);
//     await executeQuery(insertTagsQuery, [tagsData]);
//   }
// };
// // Function to update langs
// const updateLangs = async (articleId, langs) => {
//   const deleteLangsQuery = 'DELETE FROM kb_article_langs WHERE article_id = ?';
//   await executeQuery(deleteLangsQuery, [articleId]);

//   if (Array.isArray(langs) && langs.length > 0) { 
//     const insertLangsQuery = 'INSERT INTO kb_article_langs (article_id, lang) VALUES ?';
//     const langsData = langs.map(lang => [articleId, lang]);
//     await executeQuery(insertLangsQuery, [langsData]);
//   }
// };





// //Route delete
// app.delete('/api/articles/:id', (req, res) => {
//   const articleId = parseInt(req.params.id, 10);

//   if (isNaN(articleId)) {
//     return res.status(400).json({ error: 'Invalid article ID.' });
//   }

//   const updateArticleQuery = 'UPDATE kb_articles SET deleted = NOW() WHERE id = ?';

//   db.query(updateArticleQuery, [articleId], (error) => {
//     if (error) {
//       console.error('SQL error:', error);
//       return res.status(500).json({ error: 'An error occurred while deleteing (updating deleted column to NOW) the article.' });
//     }
//     res.status(200).json({ message: 'Article marked as deleted successfully.', status: 200 });
//   });
// });






app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})