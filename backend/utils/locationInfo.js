export const getLocationInfo = async (ip) => {
  const apiKey = process.env.IP_INFO_API_KEY;
  const url = `https://api.ipapi.com/${ip}?access_key=${apiKey}`;
  const options = {
    method: "GET",
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    return {
      city: result.city,
      regionName: result.region_name,
      countryName: result.continent_code,
      countryCode: result.continent_code,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
