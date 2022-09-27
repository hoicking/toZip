import React, {useRef} from 'react'
import Left from './left'
import Right from './right'
import './App.css';

function App() {

  const rightRef = useRef()

  const genImage = () => {
    console.log('======>', rightRef)
    rightRef.current.toImage()
  }

  return (
    <div className="App">
      <div id='left' className='left'>
        <Left />
      </div>

      <button onClick={genImage}>生成</button>

      <div id='right' className='right'>
        <Right cref={rightRef}/>
      </div>

    </div>
  );
}

export default App;
