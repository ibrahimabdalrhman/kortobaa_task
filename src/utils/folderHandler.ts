import fs from "fs";

export default (path: string) => {
  console.log(path);
  
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
      console.log("====",path);

  }
};

