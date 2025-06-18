const db = require('./db.service');

const createApplication = async (appData, requestingUser) => {
  const { 
    user_id, 
    application_type, 
    applicant_name, 
    property_address,
    old_bill_file_data,
    proxy_document_data,
    dask_policy_file_data,
    ownership_document_data,
    ...otherFields 
  } = appData;

  // Determine effectiveUserId based on admin rights or self-submission
  const effectiveUserId = (requestingUser.role === 'admin' && user_id) ? user_id : requestingUser.userId;
  
  try {
    const query = `
      INSERT INTO applications (
        user_id, 
        application_type, 
        applicant_name, 
        property_address, 
        installation_number, 
        dask_policy_number, 
        is_tenant, 
        landlord_full_name, 
        landlord_id_type, 
        landlord_id_number, 
        landlord_company_name, 
        landlord_representative_name, 
        power_of_attorney_provided, 
        signature_circular_provided, 
        termination_iban, 
        ownership_document_type, 
        notes,
        old_bill_file_data,
        proxy_document_data,
        dask_policy_file_data,
        ownership_document_data,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'pending')
      RETURNING *;
    `;
    
    const values = [
      effectiveUserId, 
      application_type, 
      applicant_name, 
      property_address,
      otherFields.installation_number, 
      otherFields.dask_policy_number, 
      otherFields.is_tenant,
      otherFields.landlord_full_name, 
      otherFields.landlord_id_type, 
      otherFields.landlord_id_number,
      otherFields.landlord_company_name, 
      otherFields.landlord_representative_name,
      otherFields.power_of_attorney_provided || false, 
      otherFields.signature_circular_provided || false,
      otherFields.termination_iban, 
      otherFields.ownership_document_type, 
      otherFields.notes,
      old_bill_file_data,
      proxy_document_data,
      dask_policy_file_data,
      ownership_document_data
    ];
    
    const result = await db.query(query, values);
    return { success: true, application: result.rows[0] };
  } catch (error) {
    console.error('Create application service error:', error);
    throw error;
  }
};

const getApplications = async (filters, requestingUser) => {
  let baseQuery = 'SELECT * FROM applications';
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  console.log('Requesting user:', requestingUser);
  console.log('Filters:', filters);

  // Add user_id filter for non-admin users
  if (requestingUser.role !== 'admin') {
    conditions.push(`user_id = $${paramIndex++}`);
    queryParams.push(parseInt(requestingUser.userId, 10));
  } else if (filters.user_id) {
    conditions.push(`user_id = $${paramIndex++}`);
    queryParams.push(parseInt(filters.user_id, 10));
  }

  // Add status filter if provided
  if (filters.status) {
    conditions.push(`LOWER(status) = LOWER($${paramIndex++})`);
    queryParams.push(filters.status);
  }

  // Add application_type filter if provided
  if (filters.application_type) {
    conditions.push(`LOWER(application_type) = LOWER($${paramIndex++})`);
    queryParams.push(filters.application_type);
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }
  baseQuery += ' ORDER BY submitted_at DESC';

  console.log('Final query:', baseQuery);
  console.log('Query parameters:', queryParams);

  try {
    const result = await db.query(baseQuery, queryParams);
    console.log('Query result:', result.rows);
    return { success: true, applications: result.rows };
  } catch (error) {
    console.error('Get applications service error:', error);
    throw error;
  }
};

const getApplicationById = async (applicationId, requestingUser) => {
    try {
        const result = await db.query('SELECT * FROM applications WHERE application_id = $1', [applicationId]);
        if (result.rows.length === 0) {
            return { success: false, statusCode: 404, message: 'Application not found.' };
        }
        const application = result.rows[0];
        if (requestingUser.role !== 'admin' && application.user_id !== requestingUser.userId) {
            return { success: false, statusCode: 403, message: 'Forbidden: You can only access your own applications.' };
        }
        return { success: true, application };
    } catch (error) {
        console.error('Get application by ID service error:', error);
        throw error;
    }
};

const updateApplicationById = async (applicationId, updateData, requestingUser) => {
    const { status, notes, ...otherFieldsToUpdate } = updateData;
    try {
        const currentAppResult = await db.query('SELECT * FROM applications WHERE application_id = $1', [applicationId]);
        if (currentAppResult.rows.length === 0) {
            return { success: false, statusCode: 404, message: 'Application not found.' };
        }
        const currentApp = currentAppResult.rows[0];

        const updates = [];
        const values = [];
        let paramIdx = 1;

        // User updatable fields (example: if status is 'needs_info')
        if (requestingUser.role !== 'admin' && currentApp.user_id === requestingUser.userId && currentApp.status === 'needs_info') {
            // Define which fields a user can update here
            if (otherFieldsToUpdate.property_address !== undefined) { updates.push(`property_address = $${paramIdx++}`); values.push(otherFieldsToUpdate.property_address); }
            // Add other user-updatable fields from otherFieldsToUpdate
        }

        // Admin updatable fields
        if (requestingUser.role === 'admin') {
            if (status) { updates.push(`status = $${paramIdx++}`); values.push(status); }
            if (notes !== undefined) { updates.push(`notes = $${paramIdx++}`); values.push(notes); }
            if (status && ['approved', 'rejected', 'processing'].includes(status)) {
                updates.push(`processed_at = NOW()`);
                updates.push(`processed_by_user_id = $${paramIdx++}`); values.push(requestingUser.userId);
            }
            // Admins can also update other fields if necessary
            Object.keys(otherFieldsToUpdate).forEach(key => {
                if (currentApp.hasOwnProperty(key) && key !== 'user_id' && key !== 'application_id' && key !== 'submitted_at' && key !== 'processed_at' && key !== 'processed_by_user_id') { // Basic check
                    updates.push(`${key} = $${paramIdx++}`); values.push(otherFieldsToUpdate[key]);
                }
            });
        }

        if (updates.length === 0) {
            return { success: false, statusCode: 400, message: 'No valid fields to update or not authorized for this update.' };
        }
        updates.push(`updated_at = NOW()`); // Always update this timestamp
        values.push(applicationId); // For the WHERE clause

        const query = `UPDATE applications SET ${updates.join(', ')} WHERE application_id = $${paramIdx} RETURNING *`;
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return { success: false, statusCode: 404, message: 'Application not found or update failed.' };
        }
        return { success: true, application: result.rows[0] };
    } catch (error) {
        console.error('Update application service error:', error);
        throw error;
    }
};

const deleteApplicationById = async (applicationId, requestingUser) => {
    try {
        if (requestingUser.role !== 'admin') {
            const appResult = await db.query('SELECT user_id, status FROM applications WHERE application_id = $1', [applicationId]);
            if (appResult.rows.length === 0) return { success: false, statusCode: 404, message: 'Application not found.'};
            const app = appResult.rows[0];
            if (app.user_id !== requestingUser.userId || (app.status !== 'pending' && app.status !== 'in_review')) {
                 return { success: false, statusCode: 403, message: 'Forbidden to delete this application.'};
            }
        }
        const result = await db.query('DELETE FROM applications WHERE application_id = $1 RETURNING application_id', [applicationId]);
        if (result.rowCount === 0) {
            return { success: false, statusCode: 404, message: 'Application not found.' };
        }
        return { success: true };
    } catch (error) {
        console.error('Delete application service error:', error);
        // Handle foreign key constraints if documents are not set to ON DELETE CASCADE
        throw error;
    }
};

const getDashboardStats = async (requestingUser) => {
    try {
        // Get total applications count
        const totalQuery = requestingUser.role === 'admin' 
            ? 'SELECT COUNT(*) FROM applications'
            : 'SELECT COUNT(*) FROM applications WHERE user_id = $1';
        const totalParams = requestingUser.role === 'admin' ? [] : [requestingUser.userId];
        const totalResult = await db.query(totalQuery, totalParams);

        // Get active applications count (status = 'active')
        const activeQuery = requestingUser.role === 'admin'
            ? 'SELECT COUNT(*) FROM applications WHERE status = $1'
            : 'SELECT COUNT(*) FROM applications WHERE user_id = $1 AND status = $2';
        const activeParams = requestingUser.role === 'admin' 
            ? ['active'] 
            : [requestingUser.userId, 'active'];
        const activeResult = await db.query(activeQuery, activeParams);

        // Get inactive applications count (status = 'inactive')
        const inactiveQuery = requestingUser.role === 'admin'
            ? 'SELECT COUNT(*) FROM applications WHERE status = $1'
            : 'SELECT COUNT(*) FROM applications WHERE user_id = $1 AND status = $2';
        const inactiveParams = requestingUser.role === 'admin'
            ? ['inactive']
            : [requestingUser.userId, 'inactive'];
        const inactiveResult = await db.query(inactiveQuery, inactiveParams);

        // Get recent applications
        const recentQuery = requestingUser.role === 'admin'
            ? 'SELECT * FROM applications ORDER BY submitted_at DESC LIMIT 5'
            : 'SELECT * FROM applications WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 5';
        const recentParams = requestingUser.role === 'admin' ? [] : [requestingUser.userId];
        const recentResult = await db.query(recentQuery, recentParams);

        return {
            success: true,
            stats: {
                totalCustomers: parseInt(totalResult.rows[0].count),
                activeCustomers: parseInt(activeResult.rows[0].count),
                inactiveCustomers: parseInt(inactiveResult.rows[0].count)
            },
            recentCustomers: recentResult.rows
        };
    } catch (error) {
        console.error('Get dashboard stats service error:', error);
        throw error;
    }
};

module.exports = {
  getDashboardStats,
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
  // ... other application related services
};