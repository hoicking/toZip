import React, {useEffect, useImperativeHandle, useState} from 'react'
import html2canvas from 'html2canvas'
import streamSaver from 'streamsaver'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import {ZIP} from './zip'


function Index ({cref}) {
  useEffect(() => {
    // toImage()
  }, [])

  const toImage = async () => {
    const fileStream = streamSaver.createWriteStream('archive.zip')

    const data = await getData()

    const el = document.getElementById('left')
    const canvas = await html2canvas(el, {
      useCORS: true,
      dpi: 300,
      scale: 5,
    })

    // const str = 'https://tpic.yxt.com/works/16220/12535/7c0c90cb-ae97-45dc-91ee-290c5e4583f8/79c36d13b9ba4e00a5e3f00a2f7fedba/c9f6088a08a00001e03b1402184616b0.jpg?x-oss-process=style/mini'

    const ctx = canvas.getContext('2d')

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    console.log('-----> read blob ok')


    const readableZipStream = new ZIP({
      start (ctrl) {

        // const blob = new Blob(['support blobs too'])

        // const file3 = {
        //   name: 'streamsaver-zip-example/blob-example.txt',
        //   stream: () => blob.stream()
        // }
        
        // ctrl.enqueue(file3)
        // ctrl.close()
      },
      async pull (ctrl) {
        console.log('----->pull')
        const getStream = async(textInfo, ctx, canvas, index) => {
          // ctx.clearRect(0, 0, canvas.width, canvas.height)
          textInfo.forEach(item => {
            ctx.fillStyle = item.color
            ctx.font = `${item.font}px serif`
            ctx.fillText(item.text, item.x, item.y)
          })

          return new Promise((resolve, reject) => {
            canvas.toBlob(function (blob) {
              console.log(`------>${index}`, blob)
              ctrl.enqueue({name:`blob-example${index}.png`, stream: () => blob.stream() })
              resolve(blob.stream())
              // resolve(blob)
            })
          })
        }
        // Gets executed everytime zip.js asks for more data
        // const url = 'https://d8d913s460fub.cloudfront.net/videoserver/cat-test-video-320x240.mp4'
        // const res = await fetch(url)
        // const stream = () => res.body
        // const name = 'streamsaver-zip-example/cat.mp4'
        const list = []
        // data.forEach((item, index) => {
        //   ctx.putImageData(imageData, 0, 0)
        //   list.push(getStream(item, ctx, canvas, index))
        // })
        // const res =  await Promise.all(list)
        for (let index = 0; index < data.length; index++) {
          await getStream(data[index], ctx, canvas, index)
        }

        // const zip = new JSZip()
        // res.forEach((blob, index)=> {
        //     // 添加要压缩的pdf
        //     zip.file(`${index}.png`, blob, { binary:true })
        // })
        // zip.generateAsync({type:'blob'}).then(function(content) {
        //     //生成zip并保存
        //     saveAs(content, '文件.zip')
        // })
        // if (done adding all files)
        ctrl.close()
      }
    })

    const writer = fileStream.getWriter()
    const reader = readableZipStream.getReader()
    const pump = () => reader.read()
      .then(res => res.done ? writer.close() : writer.write(res.value).then(pump))

    pump()
  }

  // const getStream = async(textInfo, ctx, canvas) => {
  //   // ctx.clearRect(0, 0, canvas.width, canvas.height)
  //   textInfo.forEach(item => {
  //     ctx.fillStyle = item.color
  //     ctx.font = `${item.font}px serif`
  //     ctx.fillText(item.text, item.x, item.y)
  //   })

  //   return new Promise((resolve, reject) => {
  //     canvas.toBlob(function (blob) {
  //       resolve(blob.stream())
  //     })
  //   })
  // }


  useImperativeHandle(cref, () => ({
    toImage: () => {
      toImage()
    }
  }))

  const getData = async() => {
    let list = []
    for (let index = 0; index < 1000; index++) {
      list.push([{text: `王尼玛${index}`, x: 120, y: 360, color: 'orange', fontsize: '24'},
      {text: '12341231', x: 190, y: 640, color: 'orange', fontsize: '24'},
      {text: '20220718', x: 390, y: 640, color: 'orange', fontsize: '24'}])
    }
    return list
  }

  return (
    <>
      <div id='image'></div>
    </>
  )
}


export default Index