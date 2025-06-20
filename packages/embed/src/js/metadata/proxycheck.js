import ProxyCheck from 'proxycheck-ts';

const proxyCheckInstance = new ProxyCheck({
  api_key: 'public-387od3-1c8880-768038',
});

const proxyCheck = async (ip) => {
  try {
    const singleIPResult = await proxyCheckInstance.checkIP(ip, {
      asn: 1,
      vpn: 3,
    });
    const result = singleIPResult[ip];

    return result || null;
  } catch (error) {
    return null;
  }
};

export default proxyCheck;
