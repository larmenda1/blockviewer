
 // IIFE - Immediately Invoked Function Expression
var Blockviewer = (function(runCode) 
{
    return runCode(window.jQuery, window, document);
}(function($, window, document) 
{
    // API variables 
    const hostEOS = "https://api.eosnewyork.io";
    const rpc = new eosjs_jsonrpc.JsonRpc(hostEOS);

    // UI variables
    let blockTable = "";
    let blockJsonArea = "";
    let reloadBtnClass = "";
    let reloadBtnIconClass = "";
    const styleJSON = 1;
    const totalTableBlocks = 10;

	// Main
    $(function () {

        // init
        blockTable = $($(".block-list")[0]);
        blockJsonArea = $($(".block-json-list")[0]);
        reloadBtnClass = "page-reload";
        reloadBtnIconClass = "page-reload-icon";

        // set reload fn
        $("." + reloadBtnClass).click(reloadPage); 

        // load blocks
        reloadPage();
    });

    // Functions (internal)
    //   API
    async function getBlock(blockNumorId, waitBit = 1) {
        let block = "";
        try {
            if (waitBit == 1) {
                block = await rpc.get_block(blockNumorId);
            }
            else {
                block = rpc.get_block(blockNumorId);
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return block;
    }
    async function getInfo() {
        let chain = "";
        try {
            chain = await rpc.get_info();
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return chain;
    }
    //   UI - Header 
    async function reloadPage() {
        try {
            // get reload btn 
            let reloadBtn = $("." + reloadBtnClass);
            if (reloadBtn.length > 0) {

                // if btn enabled
                if (!reloadBtn.prop('disabled')) {

                    // disable btn
                    reloadBtn.prop('disabled', true);

                    // add spin icon
                    let reloadBtnIcon = $("." + reloadBtnIconClass);
                    if (reloadBtnIcon.length > 0) {
                        reloadBtnIcon.addClass('fa-spin');
                    }

                    // reload blocks 
                    await loadBlocks();

                    // remove spin icon
                    if (reloadBtnIcon.length > 0) {
                        reloadBtnIcon.removeClass('fa-spin');
                    }

                    // enable btn
                    reloadBtn.prop('disabled', false);
                }
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
    }
    //   UI - Block Table
    function countBlockTableColumns() {
        let total = 0;
        try {
            let thead = blockTable.children("thead");
            if (thead.length > 0) {
                thead = $(thead[0]);
                let tr = thead.children("tr");
                if (tr.length > 0) {
                    tr = $(tr[0]);
                    let cells = tr.children();
                    total = cells.length;
                }
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return total;
    }
    function createBlockRow(block) {
        let rowString = "";
        try {
            // get data
            //let blockNum = block.block_num;
            let blockID = block.id.toString();                 // block ID (hash) 
            let timestamp = block.timestamp;
            let totalTransactions = block.transactions.length; // count of actions included in block (int)

            // create row 
            rowString = "<tr class='block-row' onClick='Blockviewer.toggleBlockJSON(this, \"" + blockID + "\")'>" +
                "<td class='block-id' title='" + blockID + "'>" + blockID + "</td>" +   
                "<td class='block-time' title='" + timestamp + "'>" + timestamp + "</td>" +
                "<td class='block-total-actions' title='" + totalTransactions + "'>" + totalTransactions + "</td>" +
                "</tr>";
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return rowString;
    }
    function createBlockRowEmpty() {
        let rowString = "";
        try {
            // count table columns
            let totalColumns = countBlockTableColumns();
            if (totalColumns > 0) {

                // create row 
                rowString = "<tr class='block-row-empty'>" +
                    "<td colspan='" + totalColumns + "'>" +
                    "No blocks were found for this service." +
                    "</td></tr>";
            }
            else {
                console.log("Error: Total Columns cannot be zero");
            }  
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return rowString;
    }
    function createBlockRowJSON(blockID, jsonRowID = "") {
        let rowString = "";
        try {
            blockID = blockID.toString();

            // get json row ID (as needed) 
            if (jsonRowID.length == 0) {
                jsonRowID = createBlockRowJSONID(blockID);
            }
            if (jsonRowID.length > 0) {

                // get json 
                let json = getBlockJSON(blockID);
                if (json.length > 0) {

                    // count table columns
                    let totalColumns = countBlockTableColumns();
                    if (totalColumns > 0) {

                        // check json 
                        if (styleJSON == 1) {
                            json = "<pre>" + JSON.stringify(JSON.parse(json), null, '\t') + "</pre>";
                        }
                        else {
                            json = JSON.stringify(JSON.parse(json));
                        }

                        // create row 
                        rowString = "<tr class='block-row-json " + jsonRowID + "'>" +
                            "<td class='cell-json' colspan='" + totalColumns + "'>" +
                            "<div class='div-json'>" +
                            json +
                            "</div></td></tr>";
                    }
                    else {
                        console.log("Error: Total Columns cannot be zero");
                    }
                }
                else {
                    console.log('Error: No JSON found for block');
                }
            }
            else {
                console.log("Error: JSON row ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return rowString;
    }
    function createBlockRowJSONID(blockID) {
        let rowID = "";
        try {
            blockID = blockID.toString();
            if (blockID.length > 0) {
                let jsonID = createJSONID(blockID);
                if (jsonID.length > 0) {
                    rowID = ("row-" + jsonID);
                } else {
                    console.log("Error: JSON ID cannot be empty (block ID: " + blockID + ")");
                }
            } else {
                console.log("Error: Block ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return rowID;
    }
    function prependBlockRow(block) {
        let results = 0;
        try {

            // create row
            let rowString = createBlockRow(block);
            if (rowString.length > 0) {

                // prepend row to table 
                let newRow = $(rowString);
                let tableBody = blockTable.children("tbody");
                tableBody.prepend(newRow);

                results = 1;
            } else {
                console.log("Error: Block row string is empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return results;
    }
    function prependBlockRowEmpty() {
        let results = 0;
        try {
            // create row
            let rowString = createBlockRowEmpty();
            if (rowString.length > 0) {

                // prepend row to table 
                let newRow = $(rowString);
                let tableBody = blockTable.children("tbody");
                tableBody.prepend(newRow);

                results = 1;
            } else {
                console.log("Error: Block row string is empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return results;
    }
    function showBlockRowJSON(blockID, blockRow, jsonRowID = "") {
        let results = 0;
        try {
            // get data
            blockID = blockID.toString();
            if (blockID.length > 0) {
                blockRow = $(blockRow);
                if (blockRow.length > 0) {
                    if (jsonRowID.length == 0) {
                        jsonRowID = createBlockRowJSONID(blockID);
                    }
                    if (jsonRowID.length > 0) {

                        // create row 
                        let rowString = createBlockRowJSON(blockID, jsonRowID);
                        if (rowString.length > 0) {

                            // add json row after block row
                            let jsonRow = $(rowString);
                            blockRow.after(jsonRow);

                            results = 1;
                        }
                        else {
                            console.log("Error: No JSON found for block (block ID: " + blockID + ")");
                        }
                    }
                    else {
                        console.log("Error: JSON row ID cannot be empty (block ID: " + blockID + ")");
                    }
                }
                else {
                    console.log("Error: Block row data cannot be empty (block ID: " + blockID + ")");
                }
            }
            else {
                console.log("Error: Block ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return results;
    }
    function toggleBlockJSON(blockRow, blockID) {
        let results = 0;
        try {
            blockID = blockID.toString();
            blockRow = $(blockRow);

            // get json row ID 
            let jsonRowID = createBlockRowJSONID(blockID);
            if (jsonRowID.length > 0) {

                // check if row exists
                let jsonRow = $("." + jsonRowID);
                if (jsonRow.length > 0) {
                    jsonRow.remove();   // if yes, remove row
                }
                else {                  // if no, add row 
                    showBlockRowJSON(blockID, blockRow, jsonRowID);
                }
                results = 1;
            }
            else {
                console.log("Error: JSON row ID cannot be empty (block ID: " + blockID + ")");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return results;
    }
    //   UI - Block JSON area
    function createJSONID(blockID) {
        let jsonID = "";
        try {
            blockID = blockID.toString();
            if (blockID.length > 0) {
                jsonID = ("json-" + blockID);
            } else {
                console.log("Error: Block ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return jsonID;
    }
    function getBlockJSON(blockID, jsonID = "") {
        let json = "";
        try {
            blockID = blockID.toString();

            // get JSON ID 
            if (jsonID.length == 0) {
                jsonID = createJSONID(blockID);
            }
            if (jsonID.length > 0) {

                // get JSON element
                let jsonElement = $("." + jsonID);
                if (jsonElement.length > 0) {

                    // get JSON text 
                    json = jsonElement[0].innerText;
                }
                else {
                    console.log("Error: JSON element not found");
                }
            }
            else {
                console.log("Error: JSON ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return json;
    }
    function prependBlockJSON(block) {
        let results = 0;
        try {
            // get data
            let blockID = block.id.toString();  // block ID (hash)
            if (blockID.length > 0) {
                let jsonID = createJSONID(blockID);
                if (jsonID.length > 0) {
                    let textJSON = JSON.stringify(block);   // block JSON (string)

                    // create div
                    let divString = "<div class='block-json " + jsonID + "'>" + textJSON + "</div>";

                    // store div in json area
                    let div = $(divString);
                    blockJsonArea.prepend(div);
                }
                else {
                    console.log("Error: JSON ID cannot be empty (block ID: " + blockID + ")");
                }
            }
            else {
                console.log("Error: Block ID cannot be empty");
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
        }
        return results;
    }
    //   Process 
    async function loadBlocks() {
        try {
            // clear table & json area
            blockTable.children("tbody").empty();
            blockJsonArea.empty();

            // get chain
            const chain = await getInfo();
            if ((chain !== null) && (Object.keys(chain).length > 0) && (totalTableBlocks > 0)) {

                // get data
                let blockNumOrID = chain.head_block_num;            // head block number
                let block = "";
                let blockData = "";

                // loop blocks
                for (i = 1; i <= totalTableBlocks; i++) {
                    if (blockNumOrID.toString().length > 0) {

                        // get block 
                        block = await getBlock(blockNumOrID);       // get block

                        // check data
                        if ((typeof block) !== 'undefined') {       // valid object
                            if ((Object.keys(chain).length > 0)) {  // if yes, data 
                                blockData = block;

                                // store block json 
                                prependBlockJSON(blockData);
                                // add block to table 
                                prependBlockRow(blockData);
                            }
                            else {                                  // if no, promise 
                                console.log("Error: Unable to retrieve block results. Please wait for Block promise results.");
                            }
                        }
                        else {
                            console.log("Error: Unable to retrieve block results");
                        }

                        // get previous block
                        blockNumOrID = blockNumOrID - 1;    
                    }
                    else {
                        console.log("Error: Block ID cannot be empty");
                    }
                } // end for loop
            }
            else {
                // no blocks found 
                prependBlockRowEmpty();

                if (totalTableBlocks <= 0) {
                    console.log("Error: Total Table Blocks should be more than 0. Please adjust JS var value.");
                }
            }
        }
        catch (err) {
            console.log('Error: ' + err.message);
        }
    } 


    // Functions (external)
    return {
        toggleBlockJSON: function (blockRow, blockID) {
            return toggleBlockJSON(blockRow, blockID);
        },
        reloadPage: function() {
            reloadPage();
        }
    };
}));

