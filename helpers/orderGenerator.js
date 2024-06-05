const express = require("express");
const generateOTP = require("otp-generator");

function orderIdGenerate(){
    return generateOTP.generate(10, { digits: true, alphabets: true, upperCase: false, specialChars: false });
}

module.exports = {

    orderIdGenerate
};