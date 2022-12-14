import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import ConfirmDialog from 'components/confirm-dialog/ConfirmDialog';
import ResoDescriptions, { ResoDescriptionColumnType } from 'components/ResoDescriptions';
import { sortBy, uniq } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Order, OrderDetail, OrderStatus, PaymentType } from 'types/order';
import { Store } from 'types/store';
import request from 'utils/axios';
import { formatCurrency, getAreaStorage } from 'utils/utils';
import OrderListItem from './OrderListItem';

type Props = {
  orderId?: number | null;
  onClose?: () => any;
  onUpdate?: () => any;
  current?: number;
  onNext?: () => any;
  onPrevious?: () => any;
  onDelete?: () => any;
  total?: number;
};

export const ORDER_STATUS_OPTIONS = [
  {
    label: 'Tất cả',
    value: OrderStatus.All,
  },
  {
    label: 'Mới',
    value: OrderStatus.New,
    color: 'warning',
  },
  {
    label: 'Đã Nhận đơn',
    value: OrderStatus.Assigned,
    color: 'warning',
  },
  {
    label: 'Đã lấy đơn',
    value: OrderStatus.PickedUp,
    color: 'warning',
  },
  {
    label: 'Hoàn thành',
    value: OrderStatus.Delivered,
    color: 'success',
  },
  {
    label: 'Đã Huỷ',
    value: OrderStatus.Cancel,
    color: 'warning',
  },
];
export const PAYMENT_TYPE_OPTIONS = [
  {
    label: 'Tiền mặt',
    value: PaymentType.Cash,
    color: 'success',
  },
  {
    label: 'Chuyển khoản ngân hàng',
    value: PaymentType.CreditPayment,
    color: 'success',
  },
  {
    label: 'Momo',
    value: PaymentType.Momo,
    color: 'success',
  },
  {
    label: 'Đã thanh toán trước',
    value: PaymentType.Paid,
    color: 'success',
  },
];
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const OrderDetailDialog = ({
  orderId,
  onClose,
  onUpdate,
  onPrevious,
  onNext,
  total,
  current,
  onDelete,
}: Props) => {
  const [open, setOpen] = useState(Boolean(orderId));
  const [openPaymentDialog, setOpenPaymentDialog] = useState<PaymentType | null>(null);

  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const store: Store = getAreaStorage() ?? {};
  const storeId = store.id;
  const { data, isLoading, refetch } = useQuery(
    [storeId, 'orders', orderId],
    () => request.get<Order>(`/orders/${orderId}`).then((res) => res.data),
    {
      enabled: Boolean(orderId),
    }
  );
  console.log('data', data);

  useEffect(() => {
    setOpen(Boolean(orderId));
  }, [orderId]);

  const orderColumns: ResoDescriptionColumnType<Order>[] = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      span: 2,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'orderAmount',
      valueType: 'money',
      render: (_, { orderAmount }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {formatCurrency(orderAmount)}
        </Typography>
      ),
    },
    {
      title: 'Phí Ship',
      dataIndex: 'shippingFee',
      valueType: 'money',
      render: (_, { shippingFee }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {formatCurrency(shippingFee)}
        </Typography>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: ORDER_STATUS_OPTIONS,
      span: 2,
    },
    {
      title: 'PT Thanh toán',
      dataIndex: 'paymentMethod',
      valueEnum: PAYMENT_TYPE_OPTIONS,
      span: 2,
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'createdAt',
      valueType: 'datetime',
      span: 2,
    },
  ];

  const fromStationColumns: ResoDescriptionColumnType<Order>[] = [
    {
      title: 'Điểm lấy',
      dataIndex: ['fromStation', 'address'],
      span: 2,
      render: (_, { fromStation }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {fromStation.address}
        </Typography>
      ),
    },
    {
      title: 'Tên người gửi',
      dataIndex: ['fromStation', 'code'],
      span: 2,
      render: (_, { fromStation }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {fromStation.code}
        </Typography>
      ),
    },
  ];
  const customerColumns: ResoDescriptionColumnType<Order>[] = [
    {
      title: 'Điểm giao',
      dataIndex: ['toStation', 'address'],
      span: 2,
      render: (_, { toStation }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {toStation.address}
        </Typography>
      ),
    },
    {
      title: 'Tên người nhận',
      dataIndex: 'customerName',
      span: 2,
      render: (_, { customerName }) => (
        <Typography variant="subtitle1" fontWeight="bold">
          {customerName}
        </Typography>
      ),
    },
    {
      title: 'SDT người nhận',
      dataIndex: 'customerPhone',
      render: (phone) => <a href={`tel: ${phone}`}>{phone}</a>,
      span: 2,
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      span: 2,
    },
  ];
  // const orders = sortBy(data?.data.list_order_details ?? [], (o) => o.supplier_id);
  // const suppliers = uniq(orders.map((order) => order.supplier_store_name));
  // const [openCollapse, setOpenCollapse] = useState<string[]>([]);
  // const getNoteOfSupplier = (storeName: string) => {
  //   const values = orders.find((e) => e.supplier_store_name === storeName);
  //   return values?.supplier_notes![0]?.content;
  // };

  // const getOrdersOfSupplier = (storeName: string) =>
  //   orders.filter((e) => e.supplier_store_name === storeName);

  // const handlerExpand = (key: string) => {
  //   let idx = openCollapse?.findIndex((e) => e === key);
  //   if (idx != null && idx >= 0) {
  //     let state = [...openCollapse];
  //     state?.splice(idx, 1);
  //     setOpenCollapse(state ?? []);
  //   } else setOpenCollapse([...openCollapse, key]);
  // };

  const handleUpdatePaymentTypeOrder = (paymentType: PaymentType) =>
    request
      .put(`/orders/${orderId}/payment`, { payment_type: paymentType })
      .then(() => {
        enqueueSnackbar('Cập nhật thành công', { variant: 'success' });
        refetch();
        return true;
      })
      .catch((error) => {
        enqueueSnackbar(error?.message ?? 'Có lỗi xảy ra! Vui lòng thử lại.', { variant: 'error' });
        return false;
      });

  const handleUpdateOrder = (status: OrderStatus) =>
    request
      .put(`/orders/${orderId}/status`, { status: status })
      .then(() => {
        enqueueSnackbar('Cập nhật thành công', { variant: 'success' });

        return true;
      })
      .catch((error) => {
        enqueueSnackbar(error?.message ?? 'Có lỗi xảy ra! Vui lòng thử lại.', { variant: 'error' });
        return false;
      });

  // @ts-ignore
  return (
    <Dialog
      maxWidth="lg"
      fullScreen
      open={open}
      scroll="body"
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      TransitionComponent={Transition}
    >
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {data?.orderCode}
          </Typography>
          {data?.paymentMethod === PaymentType.Paid ? (
            <Chip color={'primary'} variant={'outlined'} label={'Đã Thanh toán'} />
          ) : (
            <Chip color={'primary'} variant={'outlined'} label={'Thanh toán khi nhận hàng'} />
          )}
        </Toolbar>
      </AppBar>
      <Box pt={2}>
        {isLoading && (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        )}
        {!isLoading && (
          <DialogContent sx={{ my: 4, pb: 4 }}>
            <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
              <ResoDescriptions
                title="Thông tin đơn hàng"
                labelProps={{ fontWeight: 'bold' }}
                columns={orderColumns as any}
                datasource={data}
                column={2}
              />
              <ResoDescriptions
                title="Thông tin lấy hàng"
                labelProps={{ fontWeight: 'bold' }}
                columns={fromStationColumns as any}
                datasource={data}
                column={2}
              />
              <ResoDescriptions
                title="Thông tin giao hàng"
                labelProps={{ fontWeight: 'bold' }}
                columns={customerColumns as any}
                datasource={data}
                column={2}
              />
              {/* <Box sx={{ pt: 2, pb: 10 }}>
                <Stack spacing={1} direction="column">
                  {suppliers.map((s) => (
                    <Stack key={s}>
                      <Card
                        variant="elevation"
                        onClick={() => handlerExpand(s)}
                        aria-controls="example-collapse-text"
                        sx={{
                          p: 1.5,
                          bgcolor: (theme) => theme.palette.background.paper,
                        }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="h6">Đơn hàng cho {s}</Typography>
                            <KeyboardArrowDownIcon
                              style={{
                                transform: Boolean(openCollapse?.find((e) => e === s))
                                  ? 'rotate(00deg)'
                                  : 'rotate(180deg)',
                              }}
                            />
                          </Stack>
                        </Box>
                        <Collapse in={!Boolean(openCollapse?.find((e) => e === s))}>
                          <Box sx={{ mb: 1 }} id="example-collapse-text">
                            <Typography variant="subtitle1">
                              Ghi chú : {getNoteOfSupplier(s)}
                            </Typography>
                            <OrderListItem orderList={getOrdersOfSupplier(s)} />
                          </Box>
                        </Collapse>
                      </Card>
                    </Stack>
                  ))}
                </Stack>
              </Box> */}
            </DialogContentText>
          </DialogContent>
        )}
        <Box
          position="fixed"
          width="100%"
          sx={{
            left: 0,
            bottom: 0,
            borderTop: '1px solid #cccccc6f',
            textAlign: 'right',
            zIndex: 10,
            bgcolor: theme.palette.background.default,
          }}
        >
          <Stack>
            <Stack py={2} px={1} direction="row" spacing={2} justifyContent="space-between">
              <ConfirmDialog
                title={
                  openPaymentDialog == PaymentType.Momo
                    ? `Xác nhận thanh toán bằng Momo`
                    : `Xác nhận thanh toán bằng Chuyển khoản`
                }
                onClose={() => {
                  setOpenPaymentDialog(null);
                }}
                onOk={() => handleUpdatePaymentTypeOrder(openPaymentDialog ?? PaymentType.Cash)}
                open={Boolean(openPaymentDialog)}
              />
              <Box>
                <Button onClick={onDelete} color="error">
                  Hủy đơn
                </Button>
              </Box>
              <Box>
                {data?.paymentMethod === PaymentType.Cash &&
                  data?.status !== OrderStatus.Cancel && (
                    <Button onClick={() => setOpenPaymentDialog(PaymentType.Momo)}>
                      Thanh toán Momo
                    </Button>
                  )}
                {data?.paymentMethod === PaymentType.Cash &&
                  data?.status !== OrderStatus.Cancel && (
                    <Button onClick={() => setOpenPaymentDialog(PaymentType.Momo)}>
                      Chuyển khoản
                    </Button>
                  )}
                {data?.status === OrderStatus.New ? (
                  <Button onClick={() => handleUpdateOrder(OrderStatus.Assigned)}>Nhận đơn</Button>
                ) : data?.status === OrderStatus.Assigned ? (
                  <Button onClick={() => handleUpdateOrder(OrderStatus.PickedUp)}>Lấy hàng</Button>
                ) : (
                  data?.status === OrderStatus.PickedUp ?? (
                    <Button onClick={() => handleUpdateOrder(OrderStatus.Delivered)}>
                      Hoàn thành
                    </Button>
                  )
                )}
              </Box>
            </Stack>
            <Stack
              py={1}
              px={1}
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              paddingTop={-10}
            >
              <Button onClick={onNext} color="inherit">
                Trước
              </Button>
              <Box textAlign="center" mx="auto">
                <Typography>
                  {current} / {total}
                </Typography>
              </Box>
              <Button onClick={onPrevious} color="inherit">
                Tiếp theo
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};

export default OrderDetailDialog;
