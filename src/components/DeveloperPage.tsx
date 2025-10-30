import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: #ffffff;
  color: #000;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 16px;
  color: #333;
`;

const Section = styled.section`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 8px;
  color: #555;
`;

const CodeBlock = styled.pre`
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
`;

const DeveloperPage: React.FC = () => (
  <Container>
    <Title>Windexs Cloud API — Подробная документация</Title>
    {/* Authentication */}
    <Section>
      <SectionTitle>1. Регистрация пользователя</SectionTitle>
      <p>POST /api/register</p>
      <p>Тело запроса:</p>
      <CodeBlock>{`{
  "name": "string",
  "email": "string",
  "password": "string"
}`}</CodeBlock>
      <p>Успешный ответ <code>HTTP 201</code>:</p>
      <CodeBlock>{`{
  "success": true,
  "message": "Пользователь успешно зарегистрирован",
  "user": { /* данные без password */ }
}`}</CodeBlock>
    </Section>
    {/* Login & API Key */}
    <Section>
      <SectionTitle>2. Авторизация и получение API-ключа</SectionTitle>
      <p>POST /api/login</p>
      <CodeBlock>{`{
  "email": "string",
  "password": "string"
}`}</CodeBlock>
      <p>Ответ содержит новый <code>apiKey</code>:</p>
      <CodeBlock>{`{
  "success": true,
  "message": "Успешный вход в систему",
  "user": { /* user с apiKey */ }
}`}</CodeBlock>
      <p>Или получить ключ напрямую:</p>
      <p>POST /api/key</p>
      <CodeBlock>{`{
  "email": "string",
  "password": "string"
}`}</CodeBlock>
      <p>Ответ:</p>
      <CodeBlock>{`{
  "success": true,
  "apiKey": "string"
}`}</CodeBlock>
    </Section>
    {/* User Profile */}
    <Section>
      <SectionTitle>3. Работа с профилем</SectionTitle>
      <p>GET /api/user</p>
      <p>PUT /api/user (обновление)</p>
      <CodeBlock>{`{
  "name": "string",
  "email": "string"
}`}</CodeBlock>
      <p>PUT /api/user/password</p>
      <CodeBlock>{`{
  "currentPassword": "string",
  "newPassword": "string"
}`}</CodeBlock>
      <p>PUT /api/user/balance (пополнение)</p>
      <CodeBlock>{`{
  "amount": number
}`}</CodeBlock>
    </Section>
    {/* Files Management */}
    <Section>
      <SectionTitle>4. Работа с файлами и папками</SectionTitle>
      <ul>
        <li>GET /api/files?path=&lt;path&gt;</li>
        <li>GET /api/files/:fileId</li>
        <li>POST /api/upload (FormData: file, path)</li>
        <li>POST /api/folders</li>
        <li>PUT /api/files/:fileId (переименование)</li>
        <li>DELETE /api/files/:fileId</li>
        <li>GET /api/download/:fileId</li>
        <li>GET /api/search?q=&lt;query&gt;&amp;type=&lt;file|folder&gt;</li>
      </ul>
      <p>Пример скачивания файла (fetch):</p>
      <CodeBlock>{`fetch('/api/download/'+fileId, {headers:{Authorization:'Bearer '+apiKey}})`}</CodeBlock>
    </Section>
    {/* Billing */}
    <Section>
      <SectionTitle>5. Тарификация и история использования</SectionTitle>
      <p>GET /api/billing</p>
      <p>GET /api/billing/history</p>
    </Section>
    {/* Примеры кода */}
    <Section>
      <SectionTitle>6. Примеры использования</SectionTitle>
      <CodeBlock>{`// example.js
const fetch = require('node-fetch');
const fs = require('fs');
const API_URL = 'http://localhost:3001/api';
const API_KEY = 'WDX_ВАШ_КЛЮЧ_ЗДЕСЬ';

// Список файлов
fetch(API_URL + '/files?path=/', {
  headers: { 'Authorization': 'Bearer ' + API_KEY }
})
  .then(res => res.json())
  .then(data => console.log(data.files));

// Скачивание файла
fetch(API_URL + '/download/' + fileId, {
  headers: { 'Authorization': 'Bearer ' + API_KEY }
})
  .then(res => {
    const stream = fs.createWriteStream('./' + fileId);
    res.body.pipe(stream);
  });`}</CodeBlock>
      <CodeBlock>{`# example.py
import requests

API_URL = 'http://localhost:3001/api'
API_KEY = 'WDX_ВАШ_КЛЮЧ_ЗДЕСЬ'
HEADERS = {'Authorization': f'Bearer {API_KEY}'}

def list_files(path='/'):
    r = requests.get(f'{API_URL}/files', headers=HEADERS, params={'path': path})
    r.raise_for_status()
    data = r.json()
    if not data.get('success'):
        raise Exception(data.get('error'))
    return data['files']

def download_file(file_id, dest):
    r = requests.get(f'{API_URL}/download/{file_id}', headers=HEADERS, stream=True)
    r.raise_for_status()
    with open(dest, 'wb') as f:
        for chunk in r.iter_content(1024):
            f.write(chunk)

if __name__ == '__main__':
    files = list_files('/')
    print([f['name'] for f in files])
    for f in files:
        if f['type'] == 'file':
            download_file(f['id'], f['name'])
            print('Downloaded', f['name'])
            break`}</CodeBlock>
    </Section>
  </Container>
);

export default DeveloperPage;
