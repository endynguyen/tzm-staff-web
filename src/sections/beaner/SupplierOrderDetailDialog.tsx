import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import ResoDescriptions, { ResoDescriptionColumnType } from 'components/ResoDescriptions';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Order, OrderDetail, OrderItem, OrderStatus } from 'types/order';
import { Store } from 'types/store';
import request from 'utils/axios';
import { ProductType } from 'utils/constants';
import { fCurrency } from 'utils/formatNumber';
import { getAreaStorage } from 'utils/utils';

type Props = {
  orderId?: number | null;
  supplierId?: number | null;
  onClose: () => any;
  onNext: () => any;
  onPrevious: () => any;
  total: number;
  current: number;
};

export const ORDER_STATUS_OPTONS = [
  {
    label: 'Tất cả',
    value: '',
  },
  {
    label: 'Mới',
    value: OrderStatus.New,
    color: 'warning',
  },
  {
    label: 'Hoàn thành',
    value: OrderStatus.Delivered,
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

const SupplierOrderDetailDialog = ({
  orderId,
  supplierId,
  onClose,
  onNext,
  onPrevious,
  total,
  current,
}: Props) => {
  const [open, setOpen] = useState(Boolean(orderId));
  const theme = useTheme();
  const store: Store = getAreaStorage() ?? {};
  const storeId = store.id;
  const { data, isLoading } = useQuery(
    [storeId, 'suppliers', supplierId, 'orders', orderId],
    () =>
      request
        .get<{ data: OrderDetail }>(`/stores/${storeId}/suppliers/${supplierId}/orders/${orderId}`)
        .then((res) => res.data),
    {
      enabled: Boolean(orderId) && Boolean(supplierId),
    }
  );

  useEffect(() => {
    setOpen(Boolean(orderId));
  }, [orderId]);

  const orderColumns: ResoDescriptionColumnType<OrderDetail>[] = [
    {
      title: 'Số sản phẩm',
      dataIndex: 'master_product_quantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'order_status',
      valueEnum: ORDER_STATUS_OPTONS,
    },
    {
      title: 'Thời gian',
      dataIndex: 'check_in_date',
      valueType: 'datetime',
      span: 2,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_amount',
      valueType: 'money',
    },
    {
      title: 'Địa chỉ giao',
      dataIndex: 'address',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'supplier_notes',
      span: 2,
      render: (_, { supplier_notes }) => (
        <Typography>{supplier_notes?.length && supplier_notes[0].content}</Typography>
      ),
    },
  ];

  const customerColumns: ResoDescriptionColumnType<Order>[] = [
    {
      title: 'Tên khách hàng',
      dataIndex: ['customer', 'name'],
      span: 2,
    },
    {
      title: 'SDT',
      dataIndex: ['customer', 'phone_number'],
      render: (phone) => <a href={`tel: ${phone}`}>{phone}</a>,
      span: 2,
    },
  ];

  const renderOrderItem = (orderItem: OrderItem, isEndItem: boolean = false) => (
    <Stack
      mb={2}
      pb={2}
      direction="row"
      spacing={1}
      sx={{ borderBottom: !isEndItem ? '1px solid #ccc' : 'none' }}
    >
      <Box width="40px">
        <Typography variant="caption">{orderItem.quantity}x</Typography>
      </Box>
      <Box flex={1}>
        <Typography variant="body1">{orderItem.product_name}</Typography>
        <Stack spacing={0.5}>
          {orderItem.list_of_childs.map((childItem) => (
            <Typography variant="body2" key={childItem.order_detail_id}>
              {childItem.quantity} x {childItem.product_name}
            </Typography>
          ))}
        </Stack>
      </Box>
      <Box width="90px" textAlign="right">
        <Typography>{fCurrency(orderItem.final_cost)}</Typography>
      </Box>
    </Stack>
  );

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
            Đơn hàng {data?.data.invoice_id}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box pt={4}>
        {isLoading && (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        )}
        {!isLoading && (
          <DialogContent sx={{ my: 4 }}>
            <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
              <ResoDescriptions
                title="Thông tin"
                labelProps={{ fontWeight: 'bold' }}
                columns={orderColumns as any}
                datasource={data?.data}
                column={2}
              />
              <ResoDescriptions
                title="Khách hàng"
                labelProps={{ fontWeight: 'bold' }}
                columns={customerColumns as any}
                datasource={data?.data}
                column={2}
              />
              <Box py={4}>
                <Typography mb={2} variant="h5">
                  Đơn hàng
                </Typography>
                {data?.data.list_order_details
                  .filter((order) => order.product_type !== ProductType.GIFT_PRODUCT)
                  .map((order: OrderItem, idx) =>
                    renderOrderItem(order, idx === data?.data.list_order_details.length - 1)
                  )}
              </Box>
              {data?.data.list_order_details.filter(
                (order) => order.product_type === ProductType.GIFT_PRODUCT
              ).length === 0 ? (
                <Box></Box>
              ) : (
                <Box py={4}>
                  <Typography mb={2} variant="h5">
                    Quà tặng
                  </Typography>
                  {data?.data.list_order_details
                    .filter((order) => order.product_type === ProductType.GIFT_PRODUCT)
                    .map((order: OrderItem, idx) =>
                      renderOrderItem(order, idx === data?.data.list_order_details.length - 1)
                    )}
                </Box>
              )}
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
          <Stack
            py={2}
            px={1}
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
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
        </Box>
      </Box>
    </Dialog>
  );
};

export default SupplierOrderDetailDialog;
