import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { parseQueryResponse } from '../../utils/parseQueryResponse';

const ShowBalance = ({logeduserid}) => {
    const [showBalance, setShowBalance] = useState(false);
    const [balance, setBalance] = useState(null);

           const fetchBalance = async () => {
            try {
                const response = await axios.get('http://localhost:3002/query', {
                    params: {
                    'channelid': 'mychannel',
                    'chaincodeid': 'basictest',
                    'function': 'GetBankDetails',
                    'args': logeduserid
                    }
                    });

                console.log("hi response: ", response.data);
                const jsonData = parseQueryResponse(response.data);

                //second Api
                // const response1 = await axios.get('http://localhost:3002/query', {
                //     params: {
                //         'channelid': 'mychannel',
                //         'chaincodeid': 'paytest',
                //         'function': 'ViewBalance',
                //         'args': [jsonData[0].BankName, jsonData[0].BankAccountNumber]
                //     }
                // });

                const params = new URLSearchParams();
                params.append('channelid', 'mychannel');
                params.append('chaincodeid', 'paytest');
                params.append('function', 'ViewBalance');
                params.append('args', jsonData[0].BankName);
                params.append('args', jsonData[0].BankAccountNumber);

                const response1 = await axios.get('http://localhost:3002/query', {
                params: params
                    });
                console.log("hi response22: ", response1.data);
                const jsonData1 = parseQueryResponse(response1.data);

                // console.log("json ", jsonData1);
                setBalance(jsonData1);
                // setBankName(jsonData[0].BankName);
                // setAccoutNumber(jsonData[0].BankAccountNumber);
                // setBalance(response.data.balance);
            } catch (error) {
               if(!showBalance)toast.error("balance could not be fetched");

                console.error('Failed to fetch balance:', error);
            }
        };

   
    return (
        
        <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh' }}>
            
            <button onClick={() => { setShowBalance(!showBalance); fetchBalance(); }}>
                {showBalance ? 'Close' : 'Show Balance'}
            </button>
            
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2vh' }}>
            {showBalance && balance !== null && <p>Your balance is: {balance}</p>}
        </div>
        </>
    );
};

export default ShowBalance;