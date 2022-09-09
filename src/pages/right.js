import React, {useEffect, useImperativeHandle, useState} from 'react'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import * as fflate from 'fflate'


import { createDownloadStream } from './util'


function Index ({cref}) {
  useEffect(() => {
    // toImage()
  }, [])

  const toImage = async () => {
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

    const list = []
    data.forEach(item => {
      ctx.putImageData(imageData, 0, 0)
      list.push(getBlob(item, ctx, canvas))
    })
    const res = await Promise.all(list)

    console.log('-----> read blob ok')

    blobToStream(res)

    // const zip = new JSZip()
    // res.forEach((blob, index)=> {
    //     // 添加要压缩的pdf
    //     zip.file(`${index}.png`, blob, { binary:true })
    // })
    // zip.generateAsync({type:'blob'}).then(function(content) {
    //     //生成zip并保存
    //     saveAs(content, '文件.zip')
    // })
  }

  const getBlob = async(textInfo, ctx, canvas) => {
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    textInfo.forEach(item => {
      ctx.fillStyle = item.color
      ctx.font = `${item.font}px serif`
      ctx.fillText(item.text, item.x, item.y)
    })

    return new Promise((resolve, reject) => {
      canvas.toBlob(function (blob) {
        resolve(blob)
      })
    })

  }

  const blobToStream = async (blobs) => {

    try {
      const stream = (await createDownloadStream('file.zip')).getWriter()

      const buffer = bufferMacroTaskChunk((chunk) => {
        stream.write(chunk).then(() => {
          iterator.next()
        })
      })
      const zip = new fflate.Zip((err, data, final) => {
        if (err || final) {
          stream.close()
          console.log("end")
        } else {
          console.log("pull", data)
          buffer(data)
        }
      })

      const streamList = []

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i]
        const zipStream = new fflate.ZipDeflate(`王尼玛-${i}.png`, {
          level: 6,
        })
        streamList.push([blob.stream().getReader(), zipStream])
        zip.add(zipStream)
      }

      async function* read() {
        for (let i = 0; i < streamList.length; i++) {
          const [reader, zipStream] = streamList[i]
          while (true) {
            console.log("read")
            const { done, value = new Uint8Array() } = await reader.read()
            console.log("push", i, done)
            zipStream.push(value, done)
            console.log("yield")
            yield
            console.log("next")
            if (done) break
          }
        }
        zip.end()
      }
      const iterator = read()
      console.log("start")
      iterator.next()
    } catch (error) {
      console.log(error)
    }
  }

  const concatUnit8Array = (chunks) => {
    const len = chunks.reduce((len, { length }) => len + length, 0)
    const mergeArr = new Uint8Array(len)
    chunks.reduce((offset, chunk) => {
      mergeArr.set(chunk, offset)
      return offset + chunk.length
    }, 0)
    return mergeArr
  }

  //
  const bufferMacroTaskChunk = (callback) => {
    const chunks = []
    let flag = false
    return (chunk) => {
      chunks.push(chunk)
      if (!flag) {
        flag = true
        setTimeout(() => {
          console.log('----> buffer macrotask run')
          flag = false
          const mergeArr = concatUnit8Array(chunks)
          chunks.length = 0
          callback(mergeArr)
        })
      }
    }
  }

  useImperativeHandle(cref, () => ({
    toImage: () => {
      toImage()
    }
  }))

  const getData = async() => {
    let list = []
    for (let index = 0; index < 10; index++) {
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