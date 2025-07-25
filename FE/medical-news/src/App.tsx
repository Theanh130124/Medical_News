import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './component/layout/Header';
import Footer from './component/layout/Footer';
import Home from './component/Home';


const App = () => {



  return (

    <BrowserRouter>
      <Header/> 
      <Container fluid>

        <Routes>
          <Route path='/' element={<Home/>} />

        </Routes>


      </Container>

      <Footer/>



    </BrowserRouter>


  )
}

export default App;