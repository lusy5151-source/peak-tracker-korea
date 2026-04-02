/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>{siteName}에 초대되었습니다</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>초대 안내</Heading>
        <Text style={text}>
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          에 초대되었습니다. 아래 버튼을 클릭하여 초대를 수락하고 계정을 만들어 주세요.
        </Text>
        <Button style={button} href={confirmationUrl}>
          초대 수락하기
        </Button>
        <Text style={footer}>
          초대를 요청하지 않으셨다면 이 이메일을 무시해 주세요.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(69, 55%, 63%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '0.75rem',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
