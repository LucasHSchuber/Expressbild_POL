
import { HashRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

import Index from "./pages/index"

function App() {

  return (
    <>
        <HashRouter>
          <AnimatePresence mode="wait">
            {/* <Layout > */}
            <Routes>
              <Route path="/" element={<Index />} />
              {/* <Route path="/me" element={<Me />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/contact" element={<Contact />} /> */}
            </Routes>
            {/* </Layout> */}
          </AnimatePresence>
        </HashRouter>

    </>
  )
}

export default App
