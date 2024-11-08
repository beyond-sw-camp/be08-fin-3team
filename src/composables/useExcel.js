import api from '@/api/axiosinterceptor';

export function useExcelDownloader() {
    const downloadExcel = async (tableData, filename = 'dowloadExcel.xlsx', sheetname = 'sheet1') => {
        try {
            const payload = {
                tableData: tableData,
                fileName: filename,
                sheetName: sheetname
            };

            const response = await api.post('/excel/data', payload, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading Excel file:', error);
        }
    };

    const getTableData = (tableId) => {
        const table = document.getElementById(tableId);
        const tableData = [];
        for (let row of table.rows) {
            const rowData = {};
            for (let [index, cell] of [...row.cells].entries()) {
                rowData[`column${index + 1}`] = cell.textContent;
            }
            tableData.push(rowData);
        }
        return tableData;
    };

    const getTableDataForExcel = (data) => {
        return data.map((item) => {
            const rowData = {};
            Object.keys(item).forEach((key) => {
                const value = item[key];
                if (value != null && typeof value !== 'object') {
                    rowData[key] = value;
                } else if (value == null) {
                    rowData[key] = '';
                }
            });

            return rowData;
        });
    };

    return {
        downloadExcel,
        getTableData,
        getTableDataForExcel
    };
}
