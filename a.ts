type Message<T extends "text" | "image"> = {
  from: string;
  type: T;
} & (T extends "text"
  ? {
      text: {
        message: string;
      };
    }
  : {
      image: {
        uri: string;
        message?: string;
      };
    });
