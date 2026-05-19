import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type NewsletterDoiProps = {
  confirmUrl: string;
  siteName: string;
};

const main = {
  backgroundColor: '#f7f3ec',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: '24px 0',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '32px',
};

const h1 = { color: '#2a221c', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' };
const lead = { color: '#736a62', fontSize: '14px', lineHeight: '20px', margin: '0 0 24px' };
const btn = {
  backgroundColor: '#b87a90',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 24px',
  textDecoration: 'none',
};
const fine = { color: '#736a62', fontSize: '12px', lineHeight: '18px', margin: '24px 0 0' };
const hr = { borderColor: '#e7dfd5', margin: '24px 0' };

export default function NewsletterDoiEmail({ confirmUrl, siteName }: NewsletterDoiProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Bitte bestätige deine Newsletter-Anmeldung bei {siteName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Schön, dass du dabei bist!</Heading>
          <Text style={lead}>
            Bitte bestätige deine Anmeldung zum {siteName}-Newsletter, indem du auf den folgenden
            Button klickst. Ohne Bestätigung verschicken wir keine Mails an dich.
          </Text>
          <Section style={{ textAlign: 'center' }}>
            <Button href={confirmUrl} style={btn}>
              Anmeldung bestätigen
            </Button>
          </Section>
          <Text style={fine}>
            Falls der Button nicht funktioniert, kopiere diese URL in deinen Browser:
            <br />
            {confirmUrl}
          </Text>
          <Hr style={hr} />
          <Text style={fine}>
            Du hast diese E-Mail erhalten, weil sich jemand mit deiner Adresse für unseren
            Newsletter angemeldet hat. Wenn das nicht du warst, ignoriere diese Mail einfach – ohne
            Bestätigung passiert nichts.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
