const server = require("./src");

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
