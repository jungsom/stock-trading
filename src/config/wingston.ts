const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

//* 로그 파일 저장 경로 → 루트 경로/logs 폴더
const logDir = './config/logs';
require('dotenv').config();

const { combine, timestamp, label, printf } = winston.format;

//* log 출력 포맷 정의 함수
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`; // 날짜 로그레벨: 메세지
});