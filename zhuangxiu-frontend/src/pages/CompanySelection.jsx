import React, { useState, useEffect } from 'react';
import { Card, Button, Steps, message, Table, Form, Input, Select, InputNumber, Modal, Tag, Space, Alert, Divider } from 'antd';
import { BankOutlined, FileTextOutlined, CheckCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { companyAPI, contractAPI } from '../services/api';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

/**
 * 公司选择 - 整合装修公司对比和合同管理
 * 从对比公司到签约的一站式流程
 */
const CompanySelection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [form] = Form.useForm();
  const chartRef = React.useRef(null);

  useEffect(() => {
    fetchCompanies();
    fetchContracts();
  }, []);

  useEffect(() => {
    if (companies.length > 0 && chartRef.current) {
      drawRadarChart();
    }
  }, [companies]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getAll();
      setCompanies(response.data || response || []);
    } catch (error) {
      message.error('获取公司列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await contractAPI.getAll();
      setContracts(response.data || response || []);
    } catch (error) {
      console.error('获取合同列表失败', error);
    }
  };

  // 绘制雷达图
  const drawRadarChart = () => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);

    const indicators = [
      { name: '价格', max: 100 },
      { name: '工期', max: 100 },
      { name: '评价', max: 100 },
      { name: '服务', max: 100 },
      { name: '资质', max: 100 }
    ];

    const seriesData = companies.slice(0, 5).map(company => ({
      value: [
        company.priceScore || 50,
        company.periodScore || 50,
        company.evaluationScore || 50,
        company.serviceScore || 50,
        company.qualificationScore || 50
      ],
      name: company.name
    }));

    const option = {
      title: { text: '装修公司综合实力对比', left: 'center' },
      tooltip: {},
      legend: { data: companies.slice(0, 5).map(c => c.name), bottom: 10 },
      radar: { indicator: indicators },
      series: [{ name: '公司对比', type: 'radar', data: seriesData }]
    };

    myChart.setOption(option);
  };

  // 添加公司
  const handleAddCompany = async (values) => {
    try {
      setLoading(true);
      await companyAPI.create(values);
      message.success('公司添加成功');
      fetchCompanies();
      setCompanyModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('添加失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择公司
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setCurrentStep(1);
    message.success(`已选择：${company.name}`);
  };

  // 上传合同
  const handleUploadContract = async (values) => {
    try {
      setLoading(true);
      const contractData = {
        ...values,
        companyId: selectedCompany?.id,
        status: 'pending'
      };
      const response = await contractAPI.create(contractData);
      message.success('合同上传成功');
      fetchContracts();
      setContractModalVisible(false);
      form.resetFields();
      setCurrentStep(2);

      // 如果有合同ID，自动触发审核
      if (response.data?.id) {
        analyzeContract(response.data.id);
      }
    } catch (error) {
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 智能审核合同
  const analyzeContract = async (contractId) => {
    try {
      setLoading(true);
      message.info('正在分析合同，请稍候...');
      const response = await contractAPI.analyze(contractId);
      if (response.status === 'success') {
        setAnalyzeResult(response.data.analysis);
        setCurrentStep(2);
        message.success('合同分析完成');
      }
    } catch (error) {
      message.error('合同分析失败，请稍后重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const companyColumns = [
    { title: '公司名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contactName', key: 'contactName' },
    { title: '联系方式', dataIndex: 'contactPhone', key: 'contactPhone' },
    { title: '资质等级', dataIndex: 'qualificationLevel', key: 'qualificationLevel' },
    {
      title: '综合评分',
      key: 'score',
      render: (_, record) => {
        const avgScore = (
          (record.priceScore || 0) +
          (record.periodScore || 0) +
          (record.evaluationScore || 0) +
          (record.serviceScore || 0) +
          (record.qualificationScore || 0)
        ) / 5;
        return <Tag color={avgScore >= 80 ? 'green' : avgScore >= 60 ? 'blue' : 'orange'}>{avgScore.toFixed(0)}分</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleSelectCompany(record)}>
          选择此公司
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          <Step title="对比公司" icon={<BankOutlined />} />
          <Step title="上传合同" icon={<FileTextOutlined />} />
          <Step title="智能审核" icon={<SafetyOutlined />} />
          <Step title="签约确认" icon={<CheckCircleOutlined />} />
        </Steps>

        {/* 步骤1：对比公司 */}
        {currentStep === 0 && (
          <>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Button type="primary" onClick={() => setCompanyModalVisible(true)}>
                添加待选公司
              </Button>
            </div>

            {companies.length > 1 && (
              <Card title="综合实力对比" style={{ marginBottom: '16px' }}>
                <div ref={chartRef} style={{ width: '100%', height: 400 }}></div>
              </Card>
            )}

            <Table
              columns={companyColumns}
              dataSource={companies}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </>
        )}

        {/* 步骤2：上传合同 */}
        {currentStep === 1 && (
          <div>
            <Alert
              message={`已选择：${selectedCompany?.name}`}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Button type="primary" onClick={() => setContractModalVisible(true)}>
              上传装修合同
            </Button>
            <Divider />
            <Button onClick={() => setCurrentStep(0)}>返回上一步</Button>
          </div>
        )}

        {/* 步骤3：审核结果 */}
        {currentStep === 2 && analyzeResult && (
          <div>
            <Alert
              message="合同审核完成"
              description="AI已完成合同风险分析，请仔细查看以下结果"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            {analyzeResult.risks && analyzeResult.risks.length > 0 && (
              <Card title="🚨 风险识别" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {analyzeResult.risks.map((risk, index) => (
                    <Alert
                      key={index}
                      message={`${risk.type}：${risk.content}`}
                      description={`建议：${risk.suggestion}`}
                      type={risk.severity === 'high' ? 'error' : 'warning'}
                      showIcon
                    />
                  ))}
                </Space>
              </Card>
            )}

            {analyzeResult.suggestions && analyzeResult.suggestions.length > 0 && (
              <Card title="💡 修改建议">
                <ul>
                  {analyzeResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </Card>
            )}

            <Divider />
            <Space>
              <Button onClick={() => setCurrentStep(1)}>返回上一步</Button>
              <Button type="primary" onClick={() => setCurrentStep(3)}>
                继续签约
              </Button>
            </Space>
          </div>
        )}

        {/* 步骤4：签约确认 */}
        {currentStep === 3 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: '16px' }} />
            <h2>签约流程完成！</h2>
            <p>合同已保存，可在合同管理中查看</p>
            <Button type="primary" onClick={() => {
              setCurrentStep(0);
              setSelectedCompany(null);
              setAnalyzeResult(null);
            }}>
              返回首页
            </Button>
          </div>
        )}
      </Card>

      {/* 添加公司弹窗 */}
      <Modal
        title="添加待选公司"
        open={companyModalVisible}
        onCancel={() => setCompanyModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddCompany}>
          <Form.Item name="name" label="公司名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactName" label="联系人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系方式" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="qualificationLevel" label="资质等级" rules={[{ required: true }]}>
            <Select>
              <Option value="一级">一级</Option>
              <Option value="二级">二级</Option>
              <Option value="三级">三级</Option>
            </Select>
          </Form.Item>
          <Form.Item name="serviceScope" label="服务范围" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            <Form.Item name="priceScore" label="价格" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="periodScore" label="工期" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="evaluationScore" label="评价" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="serviceScore" label="服务" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="qualificationScore" label="资质" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
          </div>
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setCompanyModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>添加</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传合同弹窗 */}
      <Modal
        title="上传装修合同"
        open={contractModalVisible}
        onCancel={() => setContractModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUploadContract}>
          <Form.Item name="name" label="合同名称" rules={[{ required: true }]}>
            <Input placeholder="例如：XX装修公司施工合同" />
          </Form.Item>
          <Form.Item name="contractAmount" label="合同金额(元)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="constructionPeriod" label="工期(天)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentSchedule" label="付款方式">
            <TextArea rows={3} placeholder="例如：首付30%，中期40%，尾款30%" />
          </Form.Item>
          <Form.Item name="warrantyPeriod" label="质保期(月)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Alert
            message="提示"
            description="上传后将自动进行AI智能审核，识别潜在风险"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setContractModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>上传并审核</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanySelection;
