import {useEffect, useState} from 'react';
import Web3Helper from 'src/helpers/Web3Helper';

const MAX_ADDRESS_LEN = 21;

const getTrimmedAddress = (originalAddress: string) => {
  const addrsLen = originalAddress.length;
  if (addrsLen >= MAX_ADDRESS_LEN) {
    return `${originalAddress?.substring(0, 8)}...${originalAddress?.substring(
      addrsLen - 7,
    )}`;
  }
  return originalAddress;
};

const getFormattedAddress = (originalAddress: string) => {
  const [formattedAddress, setFormattedAddress] = useState(
    getTrimmedAddress(originalAddress),
  );

  useEffect(() => {
    (async () => {
      // resolve ens
      const res = await Web3Helper.getENSReverseDomain(originalAddress);
      if (res.success) {
        // @ts-ignore: Unreachable code error
        setFormattedAddress(res.ens);
      }
    })();
  }, []);

  return formattedAddress;
};

export {getFormattedAddress};