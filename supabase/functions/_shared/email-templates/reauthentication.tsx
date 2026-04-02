/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>인증 코드</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>본인 확인</Heading>
        <Text style={text}>아래 코드를 입력하여 본인 확인을 완료해 주세요.</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          이 코드는 잠시 후 만료됩니다. 본인이 요청하지 않으셨다면 이 이메일을 무시해 주세요.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Noto Sans KR', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(159, 15%, 22%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(159, 10%, 45%)',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(159, 15%, 22%)',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
