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
        width: 500px;
        height: 300px;
        display: flex;
      }
      #container #myid {
        width: 200px;
      }
      #container .c1 {
        flex: 1
      }
  </style>
</head>
<body>
  <div id="container">
    <div id="myid"></div>
    <div class="c1"></div>
    
  </div>
</body>
</html>
`
    )
  })
}).listen(8080)

console.log('server started')