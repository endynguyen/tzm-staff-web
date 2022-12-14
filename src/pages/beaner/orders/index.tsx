import { FilterList, Replay } from '@mui/icons-material';

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import OrderFilter from 'components/filter';
import useConfirmOrder from 'hooks/useConfirmOrder';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import { Order, OrderResponse, OrderStatus, PaymentType } from 'types/order';
import { Store } from 'types/store';
import request from 'utils/axios';
import { getAreaStorage } from 'utils/utils';
import Page from '../../../components/Page';
type Props = {};

const BeanerOrderList = (props: Props) => {
  const store: Store = getAreaStorage() ?? {};
  const navigate = useNavigate();
  const storeId = store.id;
  const [isConfirmed, updateConfirm] = useConfirmOrder();
  const [openFilter, setOpenFilter] = useState(false);
  const filterForm = useForm({
    defaultValues: {
      Status: OrderStatus.New,
    },
  });

  const filters = filterForm.watch();

  // console.log(transformdatefilter['from-date']);
  const {
    data,
    refetch: fetchOrders,
    isFetching,
  } = useQuery([storeId, 'beaner-orders', filters], () =>
    request
      .get(`/orders`, {
        params: filters,
      })
      .then((res) => res.data)
  );
  const getListOrder = (data: OrderResponse) => {
    let listOrder: Order[] = [];
    if (data != null) {
      listOrder = data?.results;
    } else listOrder = [];

    return listOrder;
  };
  console.log('Response DATA', data);
  const orderResponse: OrderResponse = data;

  const orders = useMemo(
    () => (data !== undefined || data !== null ? getListOrder(orderResponse) : null),
    [orderResponse, data]
  );

  const renderOrder = (order: Order) => {
    const isCancled = order.status === OrderStatus.Removed;
    console.log('order', order);
    return order == null ? (
      <Typography> Hi???n kh??ng c?? ????n h??ng n??o</Typography>
    ) : (
      <Card
        elevation={isCancled ? 0 : 1}
        key={order.id}
        sx={{
          bgcolor: (theme) =>
            isCancled ? theme.palette.background.neutral : theme.palette.background.paper,
        }}
      >
        <CardActionArea
          onClick={() => navigate(PATH_DASHBOARD.beaner.orders.orderDetail(order.id))}
        >
          <Box sx={{ px: 1, pt: 1 }}>
            <Stack spacing={2} direction="row">
              <Typography variant="h5">{order.orderCode}</Typography>
              {order.status === OrderStatus.Delivered && (
                <Chip color="success" size="small" label={'Ho??n th??nh'} />
              )}
              {order.status === OrderStatus.Assigned && (
                <Chip color="info" size="small" label={'???? nh???n ????n'} />
              )}
              {order.status === OrderStatus.PickedUp && (
                <Chip color="primary" size="small" label={'???? l???y h??ng'} />
              )}
              {order.status === OrderStatus.New && (
                <Chip color="warning" label={'M???i'} size="small" />
              )}
              {order.status === OrderStatus.Cancel && (
                <Chip color="error" label={'???? H???y'} size="small" />
              )}
            </Stack>
            <Box sx={{ pt: 1 }} justifyContent="space-between">
              <Typography>??i???m l???y: {order.fromStation.address}</Typography>
              <Typography>??i???m giao: {order.toStation.address}</Typography>
              <Typography>Gi??? ?????t: {new Date(order.createdAt).toLocaleTimeString()}</Typography>
            </Box>
          </Box>
        </CardActionArea>
        <CardActions>
          <Button
            onClick={() => {
              navigate(PATH_DASHBOARD.beaner.orders.orderDetail(order.id));
            }}
            size="small"
            color="primary"
          >
            Chi ti???t
          </Button>
        </CardActions>
      </Card>
    );
  };

  const today = new Date();
  const totalOrder = orders?.filter(
    (item: Order) => item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10)
  ).length;
  const totalOrderPaid = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.paymentMethod === PaymentType.Paid
  ).length;

  const totalOrderCOD = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.paymentMethod !== PaymentType.Paid
  ).length;

  const totalNewOrder = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.status === OrderStatus.New
  ).length;
  const totalAssignedOrder = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.status === OrderStatus.Assigned
  ).length;
  const totalPickedUpOrder = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.status === OrderStatus.PickedUp
  ).length;
  const totalDeliveredOrder = orders?.filter(
    (item: Order) =>
      item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10) &&
      item.status === OrderStatus.Delivered
  ).length;

  const filterOrderStatus = (status?: OrderStatus) => {
    filterForm.setValue('Status', status!);
  };

  const countTotalFilter = Object.values(filters).filter((v) => v != null).length;

  return (
    <Page title="Danh s??ch ????n h??ng">
      <Container>
        <Box textAlign="center" mb={1}>
          <Typography variant="h4">
            Danh s??ch ????n h??ng
            {/* {`: T??? ${transformdatefilter['from-date']} ?????n ${transformdatefilter['to-date']}`} */}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Card sx={{ p: 1, width: '50%', mx: 'auto', textAlign: 'left' }}>
              <Stack direction="column" justifyContent="space-between">
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body1">T???ng ????n:</Typography>
                  <Typography fontWeight="bold">{totalOrder ?? 0} </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body1">???? thanh to??n :</Typography>
                  <Typography fontWeight="bold">{totalOrderPaid ?? 0} </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body1">????n COD :</Typography>
                  <Typography fontWeight="bold">{totalOrderCOD ?? 0} </Typography>
                </Stack>
              </Stack>
            </Card>
            <Card sx={{ p: 1, width: '50%', mx: 'auto', textAlign: 'left' }}>
              <Stack direction="column" justifyContent="space-between">
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2">????n m???i:</Typography>
                  <Typography fontWeight="bold">{totalNewOrder} </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2">????n ???? nh???n:</Typography>
                  <Typography fontWeight="bold">{totalAssignedOrder}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2">????n ???? l???y:</Typography>
                  <Typography fontWeight="bold">{totalPickedUpOrder}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2">????n ???? giao:</Typography>
                  <Typography fontWeight="bold">{totalDeliveredOrder}</Typography>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Box>
        <Box>
          <Stack direction="column" spacing={1} mb={1} justifyContent="space-between">
            <Stack direction="row" spacing={1}>
              <Chip
                label="M???i"
                variant={filters.Status === OrderStatus.New ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.New)}
              />
              <Chip
                label="???? nh???n ????n"
                variant={filters.Status === OrderStatus.Assigned ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.Assigned)}
              />
              <Chip
                label="???? l???y h??ng"
                variant={filters.Status === OrderStatus.PickedUp ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.PickedUp)}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Ho??n th??nh"
                variant={filters.Status === OrderStatus.Delivered ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.Delivered)}
              />
              <Chip
                label="???? hu???"
                variant={filters.Status === OrderStatus.Cancel ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.Cancel)}
              />
              {/* <Chip
                label="T???t c???"
                variant={filters.Status === OrderStatus.All ? 'filled' : 'outlined'}
                onClick={() => filterOrderStatus(OrderStatus.All)}
              /> */}
            </Stack>

            <FormProvider {...filterForm}>
              <OrderFilter
                onReset={() =>
                  filterForm.reset({
                    Status: OrderStatus.New,
                  })
                }
                open={openFilter}
                onClose={() => setOpenFilter(false)}
              />
            </FormProvider>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Button
              color="inherit"
              sx={{ mb: 2 }}
              endIcon={<FilterList />}
              onClick={() => setOpenFilter(true)}
            >
              B??? l???c
              {countTotalFilter !== 0 && (
                <Chip sx={{ height: 24, ml: 1 }} label={countTotalFilter} color="primary" />
              )}
            </Button>
            <Box>
              {isFetching ? (
                <Box textAlign="center">
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  <IconButton size="large" color="primary" onClick={() => fetchOrders()}>
                    <Replay />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>

        <Box>
          <Stack spacing={2}>
            {orders == null || orders === undefined ? (
              <Typography> Kh??ng c?? ????n h??ng n??o</Typography>
            ) : (
              orders
                .filter(
                  (item: Order) =>
                    item.createdAt.substring(0, 10) === today.toJSON().substring(0, 10)
                )
                .map(renderOrder)
            )}
          </Stack>
        </Box>
      </Container>
    </Page>
  );
};
export default BeanerOrderList;
