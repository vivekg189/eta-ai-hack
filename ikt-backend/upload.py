import urllib.request
import uuid
import os

def upload_file(url, file_path):
    filename = os.path.basename(file_path)
    boundary = uuid.uuid4().hex
    
    with open(file_path, 'rb') as f:
        file_content = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode('utf-8') + file_content + f"\r\n--{boundary}--\r\n".encode('utf-8')

    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(body))
    }

    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as res:
            print(f"Uploaded {filename}: {res.read().decode('utf-8')}")
    except Exception as e:
        print(f"Failed to upload {filename}: {e}")

if __name__ == '__main__':
    url = "http://localhost:8000/api/documents/upload"
    upload_file(url, "test_documents/OSHA-General-Industry-Master-Inspection-Checklist.pdf")
    upload_file(url, "test_documents/6a38ce305640d_ET_AI_Hackathon_2026_Problem_Statements.pdf")
