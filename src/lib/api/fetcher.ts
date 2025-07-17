import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003';

export const fetcher = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});
