import { api } from "../api"
import { SearchRequest } from "./Search.types"

export const searchService = {
    search: (data: SearchRequest) => api.apisauce.post("/activities/request", data)
}
