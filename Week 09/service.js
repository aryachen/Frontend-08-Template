const http = require('http')

http.createServer((request, response) => {
  let body = []
  request.on('error', err => {
    console.error(err)
  }).on('data', chunk => {
    console.log('data', chunk.toString())
    body.push(chunk.toString())
  }).on('end', () => {
    console.log('body', body)
    response.writeHead(200, {'Content-Type': 'text/html'})
    // response.end('Hello World \n')
    response.end(
`<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
  <style>
      #container {
        width: 200px;
        height: 200px;
        background: green;
      }
      div p {
        color: red;
      }
      #title {
        color: black;
      }
      body div span {
        width: 30px;
        height: 30px;
      }
  </style>
</head>
<body>
  <div id="container">
    <span class="aaa">aaa</span>
    <p id="title">hello world!</p>
  </div>
</body>
</html>
`
    )
  })
}).listen(8080)

console.log('server started')