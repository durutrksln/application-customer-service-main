const applicationService = require('../services/application.service');

const getDashboard = async (req, res, next) => {
    try {
        const result = await applicationService.getDashboardStats(req.user);
        if (!result.success) {
            return res.status(result.statusCode || 400).json({ message: result.message });
        }
        res.json({
            stats: result.stats,
            recentCustomers: result.recentCustomers
        });
    } catch (error) {
        console.error('Dashboard controller error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

const createApp = async (req, res) => {
    try {
        console.log('Received application data:', req.body);
        console.log('Received files:', req.files);

        // Get file buffers
        const oldBillFileData = req.files?.old_bill_file ? req.files.old_bill_file[0].buffer : null;
        const proxyDocumentData = req.files?.proxy_document ? req.files.proxy_document[0].buffer : null;
        const daskPolicyFileData = req.files?.dask_policy_file ? req.files.dask_policy_file[0].buffer : null;
        const ownershipDocumentData = req.files?.ownership_document ? req.files.ownership_document[0].buffer : null;

        // Add file data to request body
        req.body.old_bill_file_data = oldBillFileData;
        req.body.proxy_document_data = proxyDocumentData;
        req.body.dask_policy_file_data = daskPolicyFileData;
        req.body.ownership_document_data = ownershipDocumentData;

        // Create application
        const result = await applicationService.createApplication(req.body, req.user);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(201).json(result.application);
    } catch (error) {
        console.error('Create application controller error:', error);
        return res.status(500).json({ message: 'Error creating application', error: error.message });
    }
};

const listApps = async (req, res) => {
    try {
        console.log('List applications request received');
        console.log('Query parameters:', req.query);
        console.log('User:', req.user);

        const filters = {
            status: req.query.status,
            application_type: req.query.application_type,
            user_id: req.query.user_id
        };

        console.log('Processed filters:', filters);

        const result = await applicationService.getApplications(filters, req.user);
        console.log('Service result:', result);

        if (!result.success) {
            return res.status(result.statusCode || 400).json({ message: result.message });
        }

        res.json({ applications: result.applications });
    } catch (error) {
        console.error('List applications controller error:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

const getApp = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const result = await applicationService.getApplicationById(applicationId, req.user);
        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.json(result.application);
    } catch (error) {
        console.error('Get application controller error:', error);
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
};

const updateApp = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        // Validate req.body for allowed fields based on user role and app status
        const result = await applicationService.updateApplicationById(applicationId, req.body, req.user);
        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.json(result.application);
    } catch (error) {
        console.error('Update application controller error:', error);
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
};

const deleteApp = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const result = await applicationService.deleteApplicationById(applicationId, req.user);
        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Delete application controller error:', error);
        res.status(500).json({ message: 'Error deleting application', error: error.message });
    }
};

module.exports = {
    getDashboard,
    createApp,
    listApps,
    getApp,
    updateApp,
    deleteApp,
};