import gql from 'graphql-tag';

export const schema = gql`
  type InvoiceConfig {
    id: ID!
    enabled: Boolean!
    templateString: String
  }

  type Invoice {
    id: ID!
    createdAt: DateTime
    orderCode: String!
    orderId: String!
    customerEmail: String!
    invoiceNumber: Int!
    downloadUrl: String!
  }

  type InvoiceList {
    items: [Invoice!]!
    totalItems: Int!
  }

  input InvoicesListInput {
    page: Int!
    itemsPerPage: Int!
  }

  input InvoiceConfigInput {
    enabled: Boolean!
    templateString: String
  }

  input MyInvoicesInput{
    customerEmail: String!
    list: InvoicesListInput
  }

  extend type Mutation {
    upsertInvoiceConfig(input: InvoiceConfigInput): InvoiceConfig!
    generateInvoice(id: ID!): Invoice
  }

  extend type Query {
    invoiceConfig: InvoiceConfig
    """
    Get paginated invoices
    """
    invoices(input: InvoicesListInput): InvoiceList!
    myInvoices(input: MyInvoicesInput): InvoiceList!
    invoice(orderCode: String): Invoice!
  }
`;
