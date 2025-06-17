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
    console.log({ proxyCheck: singleIPResult });

    return singleIPResult;
  } catch (error) {
    console.error(error);
  }
};

export default proxyCheck;
