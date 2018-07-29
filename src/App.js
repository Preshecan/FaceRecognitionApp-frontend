import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation.js';
import Logo from './Components/Logo/Logo.js';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js';
import Rank from './Components/Rank/Rank.js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js';
import SignIn from './Components/SignIn/SignIn.js';
import Register from './Components/Register/Register.js';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: 'de746b25f3b144b29de660320b0c3e9a'
});

const particleOptions = {
particles: {
  number:{
    value: 200,
    density:{
      enable: true,
      value_area: 800
    }
    }  
  }
}

//const initialState =     

class App extends Component {
  constructor(){
    super();
    this.state = {
    input: '',
    imageUrl:'',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id:'',
      name:'',
      email: '',
      entries: 0,
      joined:''
    }
    } 
  }

  loadUser = (data) => {
    this.setState({user: {
        id:data.id,
        name:data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  // componentDidMount(){
  //   fetch('https://arcane-cove-91957.herokuapp.com/')
  //     .then(response => response.json())
  //     //.then(console.log)
  // }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    //console.log(box); //logs the corner positions of the box in the form of a pixels from the top or left side
    this.setState({box: box})
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => {
      if(response){
        fetch(' https://arcane-cove-91957.herokuapp.com/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({
          id: this.state.user.id
        })
    })
    .then(response => response.json())
    .then(count => {
      this.setState(Object.assign(this.state.user, {entries: count}))
    })

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err))
    
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState({isSignedIn: 'false'})
    }else if(route === 'home'){
      this.setState({isSignedIn: 'true'})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box} = this.state;                   //TODO add leaderboard feature displaying current users and entry count
    return (
      <div className="App">
        <Particles className='particles'
              params={particleOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>   
        {route === 'register'
        ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        : (route === 'home') ?
        <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onPictureSubmit={this.onPictureSubmit}
        />  
        <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
        : <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        } 
      </div>
    );
  }
}

export default App;
