import  { useState, useEffect } from "react";
import { getToken } from "../../firebaseInit.js";
// import api from "../../services/api";

const Notifications = (_props: any) => {
  const [isTokenFound, setTokenFound] = useState(false);

  console.log("Token found", isTokenFound);

  // To load once
  useEffect(() => {
    let data;

    async function tokenFunc() {
      data = await getToken(setTokenFound);
      if (data) {
  
        console.log("Token is", data);
       // await api.post("/save-token", { device_token: data });

      }
      return data;
    }

    tokenFunc();
  }, [setTokenFound]);

  return <></>;
};

Notifications.propTypes = {};

export default Notifications;
