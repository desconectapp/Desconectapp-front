import { api } from "../api"
import { SearchRequest } from "./Search.types"

export const searchService = {
    search: (data: SearchRequest) => api.apisauce.post("/activities/request", data)
    // TODO: ver a que endpoint pegarle y si estan bien los datos
}
