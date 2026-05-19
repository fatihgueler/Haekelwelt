import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type OrderConfirmationItem = {
  title: string;
  quantity: number;
  lineSubtotal: string;
};

export type OrderConfirmationProps = {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderConfirmationItem[];
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  siteUrl: string;
  siteName: string;
};

const main = {
  backgroundColor: '#f7f3ec',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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

const h1 = {
  color: '#2a221c',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 8px',
};

const muted = {
  color: '#736a62',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 24px',
};

const sectionTitle = {
  color: '#2a221c',
  fontSize: '16px',
  fontWeight: 600,
  margin: '24px 0 8px',
};

const row = {
  color: '#2a221c',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const totalRow = {
  color: '#2a221c',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '24px',
  margin: '12px 0 0',
};

const hr = {
  borderColor: '#e7dfd5',
  margin: '16px 0',
};

export default function OrderConfirmationEmail(props: OrderConfirmationProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>
        Vielen Dank für deine Bestellung {props.orderNumber} bei {props.siteName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Vielen Dank für deine Bestellung!</Heading>
          <Text style={muted}>
            Hallo {props.customerName}, wir haben deine Bestellung erhalten und beginnen mit der
            Vorbereitung. Du bekommst eine weitere E-Mail, sobald dein Paket versendet wurde.
          </Text>

          <Text style={row}>
            <strong>Bestellnummer:</strong> {props.orderNumber}
          </Text>
          <Text style={row}>
            <strong>Datum:</strong> {props.orderDate}
          </Text>

          <Heading as="h2" style={sectionTitle}>
            Deine Artikel
          </Heading>
          {props.items.map((item, i) => (
            <Text key={i} style={row}>
              {item.quantity} × {item.title} – {item.lineSubtotal}
            </Text>
          ))}

          <Hr style={hr} />
          <Section>
            <Text style={row}>Zwischensumme: {props.subtotal}</Text>
            <Text style={row}>Versand: {props.shipping}</Text>
            <Text style={row}>davon MwSt.: {props.tax}</Text>
            <Text style={totalRow}>Gesamt: {props.total}</Text>
          </Section>

          <Heading as="h2" style={sectionTitle}>
            Lieferadresse
          </Heading>
          <Text style={row}>{props.shippingAddress.name}</Text>
          <Text style={row}>{props.shippingAddress.line1}</Text>
          {props.shippingAddress.line2 ? (
            <Text style={row}>{props.shippingAddress.line2}</Text>
          ) : null}
          <Text style={row}>
            {props.shippingAddress.postalCode} {props.shippingAddress.city}
          </Text>
          <Text style={row}>{props.shippingAddress.country}</Text>

          <Hr style={hr} />
          <Text style={muted}>
            Bei Fragen zu deiner Bestellung antworte einfach auf diese E-Mail. Diese Mail wurde von{' '}
            {props.siteUrl} versendet.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
