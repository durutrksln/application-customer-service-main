    except Exception as e:
        app.logger.error(f"Error in create_application: {str(e)}")
        app.logger.error(f"Error type: {type(e)}")
        app.logger.error(f"Error args: {e.args}")
        app.logger.error(f"Error traceback: {traceback.format_exc()}")
        
        if isinstance(e, werkzeug.exceptions.RequestEntityTooLarge):
            return jsonify({
                'error': 'File too large',
                'message': 'The uploaded file exceeds the maximum allowed size of 5MB',
                'field': str(e)
            }), 413
        elif 'MulterError' in str(e):
            return jsonify({
                'error': 'File upload error',
                'message': str(e),
                'field': str(e),
                'details': {
                    'type': str(type(e)),
                    'args': e.args,
                    'traceback': traceback.format_exc()
                }
            }), 400
        else:
            return jsonify({
                'error': 'Internal server error',
                'message': str(e),
                'field': str(e),
                'details': {
                    'type': str(type(e)),
                    'args': e.args,
                    'traceback': traceback.format_exc()
                }
            }), 500 