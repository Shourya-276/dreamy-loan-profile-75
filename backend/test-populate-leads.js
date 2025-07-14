import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test the populate leads endpoint
async function testPopulateLeads() {
    try {
        console.log('🔄 Testing populate leads endpoint...');
        
        const response = await axios.post(`${BASE_URL}/leads-management/populate`, {}, {
            headers: {
                'x-user-role': 'admin',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Populate leads response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error populating leads:', error.response?.data || error.message);
        return null;
    }
}

// Test the update statuses endpoint
async function testUpdateStatuses() {
    try {
        console.log('🔄 Testing update lead statuses endpoint...');
        
        const response = await axios.put(`${BASE_URL}/leads-management/update-statuses`, {}, {
            headers: {
                'x-user-role': 'admin',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Update statuses response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error updating statuses:', error.response?.data || error.message);
        return null;
    }
}

// Test manual assignment
async function testManualAssignment(customerId, salesManagerId) {
    try {
        console.log('🔄 Testing manual customer assignment...');
        
        const response = await axios.post(`${BASE_URL}/leads-management/assign`, {
            customerId: customerId,
            salesManagerId: salesManagerId,
            loanType: 'home_loan'
        }, {
            headers: {
                'x-user-role': 'admin',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Manual assignment response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error with manual assignment:', error.response?.data || error.message);
        return null;
    }
}

// Test getting leads after population
async function testGetLeads() {
    try {
        console.log('🔄 Testing get leads endpoint...');
        
        const response = await axios.get(`${BASE_URL}/sales-manager/leads/1?page=1&limit=10`, {
            headers: {
                'x-user-role': 'salesmanager',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Get leads response:');
        console.log(`   Total leads: ${response.data.pagination?.total || 'N/A'}`);
        console.log(`   Current page: ${response.data.pagination?.page || 'N/A'}`);
        console.log(`   Leads on this page: ${response.data.leads?.length || 0}`);
        
        if (response.data.leads && response.data.leads.length > 0) {
            console.log('   Sample lead:', response.data.leads[0]);
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Error getting leads:', error.response?.data || error.message);
        return null;
    }
}

// Test leads overview endpoint
async function testLeadsOverview() {
    try {
        console.log('🔄 Testing leads overview endpoint...');
        
        const response = await axios.get(`${BASE_URL}/leads-management/overview`, {
            headers: {
                'x-user-role': 'admin',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Leads overview response:');
        console.log('   Summary:', response.data.summary);
        console.log('   Status Distribution:', response.data.statusDistribution);
        console.log('   Sales Manager Workload:', response.data.salesManagerWorkload);
        console.log(`   Recent Activities: ${response.data.recentActivities?.length || 0} entries`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error getting leads overview:', error.response?.data || error.message);
        return null;
    }
}

// Test unassigned customers endpoint
async function testUnassignedCustomers() {
    try {
        console.log('🔄 Testing unassigned customers endpoint...');
        
        const response = await axios.get(`${BASE_URL}/leads-management/unassigned?page=1&limit=5`, {
            headers: {
                'x-user-role': 'admin',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Unassigned customers response:');
        console.log(`   Total unassigned: ${response.data.pagination?.total || 0}`);
        console.log(`   Customers on this page: ${response.data.customers?.length || 0}`);
        
        if (response.data.customers && response.data.customers.length > 0) {
            console.log('   Sample unassigned customer:', response.data.customers[0]);
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Error getting unassigned customers:', error.response?.data || error.message);
        return null;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting leads population tests...\n');

    // Step 1: Populate leads from customers
    const populateResult = await testPopulateLeads();
    if (!populateResult) {
        console.log('❌ Failed to populate leads, stopping tests');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 2: Update lead statuses
    await testUpdateStatuses();

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 3: Get leads overview
    await testLeadsOverview();

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 4: Check unassigned customers
    await testUnassignedCustomers();

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 5: Get leads to verify population
    await testGetLeads();

    console.log('\n✅ All tests completed!');
}

// Check if script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(error => {
        console.error('Fatal error running tests:', error);
        process.exit(1);
    });
}

export { testPopulateLeads, testUpdateStatuses, testManualAssignment, testGetLeads, testLeadsOverview, testUnassignedCustomers }; 