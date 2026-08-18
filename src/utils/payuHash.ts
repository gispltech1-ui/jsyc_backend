import crypto from "crypto";
import { PAYU } from "../config/payment";

interface GenerateHashProps {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
}

export const generatePayUHash = ({
  txnid,
  amount,
  productinfo,
  firstname,
  email,
}: GenerateHashProps) => {
  const hashString =
    `${PAYU.key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}` +
    "|||||||||||" +
    PAYU.salt;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return hash;
};