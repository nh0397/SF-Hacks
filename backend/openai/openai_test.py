import openai

file_content = openai.File.download("file-7vRU2uV8YHwLXXx7Xky7HV")
print(file_content.decode('utf-8'))