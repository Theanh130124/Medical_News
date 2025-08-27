import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './component/layout/Header';
import Footer from './component/layout/Footer';
import Home from './component/Home';
import cookie from 'react-cookies'
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './component/auth/Register';
import Login from './component/auth/Login';
import { useEffect, useReducer } from 'react';
import MyUserReducer from './reducers/MyUserReducer';
import { MyDipatcherContext, MyUserContext } from './configs/MyContexts';
import MyToaster from './component/layout/MyToaster';
import UploadCertification from './component/auth/UploadCertification';
import TimeLine from './component/post/TimeLine';
import Profile from './component/auth/Profile';
import ProtectedRoute from './component/wrapper/ProtectedRoute';
import OtherProfile from './component/auth/OtherProfile';




const App = () => {

  //dispatch nhận action.type bên MyUserReducer.tsx-> F5 sẽ không mất vì đã lưu cookie

  const [user, dispatch] = useReducer(MyUserReducer, cookie.load('user') || null);





  return (
    <MyUserContext.Provider value={user}>
       <MyDipatcherContext.Provider value={dispatch}>
    <BrowserRouter>
      <Header/> 
      <Container fluid>
        <MyToaster />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/register' element ={<Register/>} />
          <Route path='/login' element ={<Login/>} />
          <Route path='/uploadCertification' element={
            <ProtectedRoute><UploadCertification/></ProtectedRoute>
          } />

            <Route path='/otherprofile/:userId' element={
            <ProtectedRoute><OtherProfile/></ProtectedRoute>
          } />

          <Route path='/timeline' element={
            <ProtectedRoute><TimeLine/></ProtectedRoute>
          } />

          <Route path='/profile' element={
            <ProtectedRoute><Profile/></ProtectedRoute>
          } />

        </Routes>


      </Container>

      <Footer/>



    </BrowserRouter>
    </MyDipatcherContext.Provider>
 </MyUserContext.Provider>

  )
}

export default App;