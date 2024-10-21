import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';
import dbConfig from './dbConfig.js'; 
console.log("dbConfig: ", dbConfig);

const app = express();
const port = 5000;

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
      o.subjectname,
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



app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})