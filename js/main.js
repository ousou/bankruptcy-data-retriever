var params = {
    apiBaseURL: 'http://avoindata.prh.fi:80/tr/v1/publicnotices',
    tableId: 'resultTable',
    startDateInputId: 'startDate',
    endDateInputId: 'endDate',
};

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['table']});

function drawTable (tableId, data) {
    var table = new google.visualization.Table(document.getElementById(tableId));    
    table.draw(data, {width: '100%', height: '100%', sortColumn: 2, sortAscending: true});    
};

function createTableDataObject  () {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Business id');
    data.addColumn('string', 'Company name');
    data.addColumn('string', 'Bankruptcy date');

    return data;
};

function clearTableRows (tableId) {
    $(tableId).find('tbody').remove();
    $(tableId).append('<tbody></tbody>');
};

function addEntryRowToTable (entry, tableData) {
    tableData.addRow([entry.businessId, entry.name, entry.registrationDate]);
};

function getBankruptcies (amount) {
    var tableId = params.tableId;
    $.ajax({
        type: 'GET',
        url: getFullUrl(amount, $('#startDate').val(), $('#endDate').val()),
        dataType: 'json',
        success: function (response) {
            var tableData = createTableDataObject();
            $.each(response.results, function (index, entry) {
                addEntryRowToTable(entry, tableData);
            });
            drawTable(tableId, tableData);
        },
        error: function (error) {
            swal('Error when loading bankruptcies', 'Error message: ' + JSON.stringify(error), 'error');
            console.log(error);
        }

    });
};

function getFullUrl(numberOfResults, startDate, endDate) {
    var fullUrl = params.apiBaseURL + "?totalResults=true";
    fullUrl += "&entryCode=KONALK";
    if (numberOfResults !== undefined && numberOfResults !== null) {
        fullUrl += "&maxResults=" + numberOfResults;
    }
    if (startDate !== undefined && startDate !== null) {
        fullUrl += "&noticeRegistrationFrom=" + startDate;
    }
    if (endDate !== undefined && endDate !== null) {
        fullUrl += "&noticeRegistrationTo=" + endDate;
    }
    return fullUrl;
}
