import { create, ApisauceInstance } from 'apisauce'

const LOCATION_IQ_KEY = process.env.EXPO_PUBLIC_LOCATION_IQ_API_KEY || ''

// Create an apisauce instance dedicated to LocationIQ
export const locationIqClient: ApisauceInstance = create({
  baseURL: 'https://us1.locationiq.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Ensure the `key` query param is present on every request
locationIqClient.addRequestTransform((request) => {
  // apisauce request object has a `params` property where query params live
  request.params = {
    ...(request.params || {}),
    key: LOCATION_IQ_KEY,
  }
})

export default locationIqClient
