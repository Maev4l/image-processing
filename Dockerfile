FROM public.ecr.aws/lambda/nodejs:12

# ARG FUNCTION_DIR="/var/task"

# Create function directory
# RUN mkdir -p ${FUNCTION_DIR}

# Copy handler function and package.json
COPY handler.js ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}


# Install NPM dependencies for function
RUN npm install --only=production

CMD [ "handler.resize" ]