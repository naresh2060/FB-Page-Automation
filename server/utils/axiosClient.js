import axios from "axios";

export const graphClient = axios.create({
    baseURL: "https://graph.facebook.com/v25.0/",
});
