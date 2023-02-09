# PAA Invoicing Project

- - -

## 1. Excel to Word Document Conversion

- - -

## 2. Hours Collector

### How to Deploy
1. Clone the project
```
git clone https://github.com/spiltbeans/paa-invoicing.git
```
2. Add environment variables
```
touch .env && nano .env
```
The following environment variables are required:
```
DATA_PATH=<DATA_FILE_PATH>
```

3. Create the file path
```
mkdir /data/hours_collector && cd /data/hours_collector
```

4. Copy the work_descriptions file into the data folder

Use the following for Google Drive files
```
wget --no-check-certificate 'https://docs.google.com/uc?export=download&id=<FILEID>' -O <FILENAME>
```
> Note you can find the file id in Google documents by opening public access and retrieving from
> pattern https://docs.google.com/spreadsheets/d/<FILEID>/edit?...

5. Build and run the container
```
docker-compose build && docker-compose up -d
```

## References
- https://runkit.com/dolanmiu/docx-demo10
- https://github.com/dolanmiu/docx/tree/29f421686fc5e0d0bd1aa6ef7c2d639d3ec1c26e/docs/usage
- https://www.npmjs.com/package/xlsx