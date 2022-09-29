import React, {useState, useEffect, useRef} from 'react'

import { Button, Drawer, Space, Select, message } from 'antd'
import html2canvas from 'html2canvas'
import streamSaver from 'streamsaver'

import './index.css'

const { Option } = Select

function Index () {
  const [open, setOpen] = useState(false)

  const [current, setCurrent] = useState(null)
  const [zipNum, setZipNum] = useState(1)

  const timeRef = useRef(0)
  
  const [defaultImages, setDefaultIamges] = useState([
    {
      path: '/images/image-1.png',
      width: 1754,
      height: 2480,
      text: [
        {text: 'testname',x: '328.983', y: '1093.42', color: 'orange', fontsize: 58},
        {text: '090182',x: '569.298', y: '2003.06', color: 'orange', fontsize: 58},
        {text: '2012-12-21',x: '1220.82', y: '2006.21', color: 'orange', fontsize: 58},
      ]
    },
    {
      path: '/images/image-2.png'
    },
    {
      path: '/images/image-3.png'
    }
  ])


  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const download = () => {
    message.info('开始下载')
    const interval = setInterval(() => {
      timeRef.current += 1
    }, 1000)
    
    const canvas = document.getElementById('download')
    const ctx = canvas.getContext('2d')
    const image = new Image()
    image.src = current.path

    image.onload = async () => {
      const fileStream = streamSaver.createWriteStream('archive.zip')
      
      const data = await getData()

      const readableZipStream = new window.ZIP({
        start (ctrl) {
        },
        async pull (ctrl) {
          const getStream = async(textInfo, index) => {
            // ctx.clearRect(0, 0, canvas.width, canvas.height)
            textInfo.forEach(item => {
              ctx.fillStyle = item.color
              ctx.font = `${item.fontsize}px serif`
              ctx.fillText(`${item.text}-${index}`, item.x, item.y)
            })
  
            return new Promise((resolve, reject) => {
              canvas.toBlob(function (blob) {
                resolve(blob)
              })
            }).then((value)=> {
              console.log(`------${index}`)
              ctrl.enqueue({name:`blob-example${index}.png`, stream: () => value.stream() })
            })
          }

          for (let index = 0; index < data.length; index++) {
            ctx.clearRect(0, 0, current.width, current.height)
            ctx.drawImage(image, 0, 0,canvas.width, canvas.height)
            await getStream(data[index].text, index)
          }

          ctrl.close()
        }
      })

      if (window.WritableStream && readableZipStream.pipeTo) {
        return readableZipStream.pipeTo(fileStream)
        .then(() => {
          console.log('下载成功')
          clearInterval(interval)
          message.success(`下载耗时${timeRef.current}`)
          timeRef.current = 0
         })
        .catch((error)=>{
          console.log('网络不佳,下载失败', error)
          clearInterval(interval)
          message.error(`下载失败${timeRef.current}`)
          timeRef.current = 0
        })
      }
    }
  }

  const getData = async () => {
    let list = []
    for (let index = 0; index < zipNum; index++) {
      list.push(current)
    }
    return list
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      console.log('support service worker')
      navigator.serviceWorker.register('./serviceWorker.js', {scope: './'}).then(()=> {
        console.log('regist success')
      }).catch((error) => {
        console.log('regist error', error)
      })
    }
  }, [])

  useEffect(() => {
    const drawPreview = async() => {
      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext('2d')
      const image = new Image()
      image.src = current.path

      image.onload = () => {
        ctx.drawImage(image, 0, 0,canvas.width, canvas.height)
        const scale = (800/current.height)
        current.text.forEach(item => {
          ctx.fillStyle = item.color
          ctx.font = `${item.fontsize * scale}px serif`
          ctx.fillText(item.text, item.x * scale, item.y * scale)
        })
      }
    }

    if (current) {
      drawPreview()
    }
    //
  }, [current])

  return (
    <>
      <Space>
        <Button type="primary" onClick={showDrawer}>
          选择证书
        </Button>

        {
          current && <>
            导出数量: 
            <Select defaultValue={1} style={{ width: 120 }} onChange={setZipNum}>
              <Option value={1}>1</Option>
              <Option value={100}>100</Option>
              <Option value={200}>200</Option>
              <Option value={300}>300</Option>
            </Select>

            <Button type="primary" onClick={download}>
              下载
            </Button>
          </>
        }

      </Space>
      <div>预览</div>

      {
        current && <div>
          <canvas id="canvas" height={800} width={current.width * (800 / current.height)}/>

          <canvas className='hide-canvas' id="download" height={current.height} width={current.width} />
        </div>
      }

      <div id="cert"></div>
      <Drawer
        title="Basic Drawer"
        placement="left"
        closable={false}
        onClose={onClose}
        open={open}
        key="left"
      >
        {
          defaultImages.map((item, index) => {

            return (
              <div key={index}>
                <img className='image' key={index} src={item.path} alt="" onClick={() => setCurrent(item)}/>
                <div className='text'>证书 {index + 1}</div>
              </div>
            )

          })
        }
      </Drawer>
    </>
  )

}

export default Index