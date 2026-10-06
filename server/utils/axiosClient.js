import axios from "axios";

export const graphClient = axios.create({
    baseURL: "http://graph.facebook.com/v25.0/",
});
