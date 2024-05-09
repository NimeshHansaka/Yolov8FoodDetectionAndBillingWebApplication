
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/HomePage/HomePage';
import CaptureImage from './Components/CaptureImage/CaptureImage';
import Details from './Components/Details/Details';
import AdminLogin from './Components/AdminLogin/AdminLogin';
import FoodItems from './Components/FoodItems/FoodItems';
import DailySale from './Components/DailySale/DailySale';
import MonthlySale from './Components/MonthlySale/MonthlySale';


//import Payment from './Components/Payment/Payment';



const App = () => {
    return (

       

         <>



<div className='container'>
         <Router>
        
            <Routes>

           
           
                <Route exact path="/" element={<Home />} />
                <Route path="/app" element={<CaptureImage />} />
                {/* <Route path="/createpayment" element={<Payment/>} /> */}
                <Route path="/details" element={<Details />} />
                <Route path="/admin/login" element={<AdminLogin/>} />
                <Route path="/admin/details" component={<Details />} />
                <Route path="/admin/fooditems" element={<FoodItems/>} />
                <Route path="/dailysale" element={<DailySale/>} />
                <Route path="/monthlysale" element={<MonthlySale/>} />

            
            </Routes>
       
    </Router> 

    </div>

</>

    );
};

export default App;