
const {CreateSaleTransactionHistoryManager} = require('managers');
const {z} = require("zod");

const SalesManagementMcpController = require('../../SalesManagementServiceMcpController');

class CreateSaleTransactionHistoryMcpController extends SalesManagementMcpController {
  constructor(params) {
    super("createSaleTransactionHistory", "createsaletransactionhistory",params);
    this.dataName = 'saleTransactionHistory';
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateSaleTransactionHistoryManager(this.request,"mcp");
  }

  static getOutputSchema() {
   return z.object({
      status: z.string(),
      saleTransactionHistory: z.object({
      id:z.string().uuid().describe('The unique primary key of the data object as UUID'),transactionId: z.string().uuid().describe("Reference to the saleTransaction that was changed."),changeType: z.enum(['correction','deletion']).describe("Type of change applied: 0="correction", 1="deletion"."),changedByUserId: z.string().uuid().describe("User who made this change (usually manager or seller correcting/updating transaction)."),changeTimestamp: z.string().describe("Timestamp when change was made."),correctionJustification: z.string().optional().nullable().describe("User inputted justification (if any) given for the correction or deletion."),previousData: z.object().describe("Snapshot of the saleTransaction before the change."),newData: z.object().optional().nullable().describe("Snapshot of the saleTransaction after the change (if correction)."),storeId: z.string().uuid().describe("An ID value to represent the tenant id of the store"),isActive: z.boolean().describe('The active status of the data object to manage soft delete. False when deleted.'),
    }).describe("Audit log for sale transaction changes and corrections. Records every update or delete to a saleTransaction, including before/after snapshots, user who made the change, change type, timestamp, and provided justifications."),
    }).describe("The response object of the crud route");
  }

 static getInputScheme() {
    return {
    
      storeCodename : z.string().optional().describe("Write the unique codename of the store so that your request will be autheticated and handled in your tenant scope."),
        
    accessToken : z.string().optional().describe("The access token which is returned from a login request or given by user. This access token will override if there is any bearer or OAuth token in the mcp client. If not given the request will be made with the system (bearer or OAuth) token. For public routes you dont need to deifne any access token."),
                        transactionId : z.string().uuid().describe("Reference to the saleTransaction that was changed."),
             
                    changeType : z.enum([]).describe("Type of change applied: 0="correction", 1="deletion"."),
             
                    changedByUserId : z.string().uuid().describe("User who made this change (usually manager or seller correcting/updating transaction)."),
             
                    changeTimestamp : z.string().describe("Timestamp when change was made."),
             
                    correctionJustification : z.string().optional().describe("User inputted justification (if any) given for the correction or deletion."),
             
                     previousData : z.object({
                     }).describe("Snapshot of the saleTransaction before the change."),
         
             
                     newData : z.object({
                     }).optional().describe("Snapshot of the saleTransaction after the change (if correction)."),
         
             
         }
  }

}

module.exports = (headers) => {
return {
  name: "createSaleTransactionHistory",
  description: "Create a sale transaction correction/deletion history entry (normally invoked by update/delete route automation, not end-user).",
  parameters: CreateSaleTransactionHistoryMcpController.getInputScheme(),
  controller:  async (mcpParams) => {
    mcpParams.headers =  headers;
  const createSaleTransactionHistoryMcpController =  new CreateSaleTransactionHistoryMcpController(mcpParams);
  try {
    const result = await createSaleTransactionHistoryMcpController.processRequest();
    //return CreateSaleTransactionHistoryMcpController.getOutputSchema().parse(result);  
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        },
      ],
    };
  } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${err.message}`,
          },
        ],
      };
  }
}
}

}



