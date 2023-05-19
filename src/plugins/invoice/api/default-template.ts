export const defaultTemplate = `
<!DOCTYPE html>
<html style="zoom: 0.55">
<head>
  <meta charset="utf-8" />
  <title>Order {{ order.code }}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif">
<table style="width: 100%">
  <tr>
    <td>
      <br />
      <br />
      Thanks for your order!
    </td>
  </tr>
</table>

<hr />

<br />
<br />
<br />

<table style="width: 100%">
  <tr>
    <td>
      {{#with order.shippingAddress }}
      {{ fullName }}<br />
      {{#if company}} {{ company }}<br />
      {{/if}} {{#if streetLine1}} {{ streetLine1 }} {{ streetLine2 }}<br />
      {{/if}} {{#if postalCode}} {{ postalCode }}, {{ city }}<br />
      {{/if}} {{#if country}} {{ country }}<br />
      {{/if}} {{/with}}
      {{ customerEmail }}<br />
    </td>
    <td>
      Order: {{ order.code }} <br />
      InvoiceNr: {{ invoiceNumber }} <br />
      Date: {{ orderDate }}
    </td>
  </tr>
</table>

<br />
<br />
<br />

<table style="width: 100%">
  {{#each order.lines }}
  <tr>
    <td>{{ quantity }} x</td>
    <td>{{ productVariant.name }}</td>
    <td style="text-align: right">Br {{ formatMoney linePrice }}</td>
  </tr>
  {{/each}}

  {{#each order.discounts }}
  <tr>
    <td></td>
    <td>{{ description }}</td>
    <td style="text-align: right">Br {{ formatMoney amount }}</td>
  </tr>
  {{/each}}

  <tr>
    <td></td>
    <td>Shipping ex tax</td>
    <td style="text-align: right">
      Br {{ formatMoney order.shipping }}
    </td>
  </tr>

  <tr></tr>
</table>

<hr />

<table style="width: 100%">

  <tr>
  </tr>
  <tr>
    <td style="text-align: right">Subtotal</td>
    <td style="text-align: right">Br {{ formatMoney order.total }}</td>
  </tr>

  {{#each order.taxSummary }}
  {{#if taxRate}}
  <tr style="text-align: right">
    <td>Tax {{ taxRate }} %</td>
    <td style="text-align: right">
      €{{ formatMoney taxTotal }}
    </td>
  </tr>
  {{/if}}
  {{/each}}

  <tr style="text-align: right">
    <td><strong>Total inc. tax</strong></td>
    <td style="text-align: right">
      <strong>€{{ formatMoney order.totalWithTax }}</strong>
    </td>
  </tr>
</table>

<br />
</body>
</html>

`;
