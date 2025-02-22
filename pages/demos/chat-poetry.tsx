import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  Link as JoyLink,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const Schema = z.object({ query: z.string().min(1) });

export default function DatasourcesPage() {
  const router = useRouter();
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = useStateReducer({
    currentDatastoreId: 'clggib2du0000kz084jos02sq',
    history: [] as { from: 'human' | 'agent'; message: string }[],
    loading: false,
  });

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const onSubmit = async (data: any) => {
    if (!data.query || !state.currentDatastoreId) return;

    methods.reset();

    const history = [
      ...state.history,
      { from: 'human', message: data.query as string },
    ];

    setState({
      history: history as any,
      loading: true,
    });

    const result = await axios.post(`/chat/${state.currentDatastoreId}`, {
      query: data.query,
    });

    setState({
      loading: false,
      history: [
        ...history,
        { from: 'agent', message: result.data.answer as string },
      ] as any,
    });
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo(0, scrollableRef.current.scrollHeight);
  }, [state?.history?.length]);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        px: {
          xs: 2,
          md: 6,
        },
        pt: {},
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gap: 1,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography level="h1" fontSize="xl4">
          Chat - Poetry Demo
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />
      {/* {(getDatastoresQuery?.data?.length || 0) > 0 &&
        !state?.currentDatastoreId && (
          <Alert
            color="warning"
            variant="soft"
            sx={{ mx: 'auto', mt: 6 }}
            size="lg"
          >
            {`Select the datastore you want to query.`}
          </Alert>
        )} */}
      {/* 
      {(getDatastoresQuery?.data?.length || 0) <= 0 && (
        <Card variant="outlined" sx={{ mx: 'auto', mt: 6, p: 4 }}>
          <Stack gap={4}>
            <Typography level="h5">
              {`You don't have any datastores yet. Please create one first.`}
            </Typography>

            <Link href={RouteNames.DATASTORES}>
              <Button
                sx={{ mr: 'auto' }}
                endDecorator={<ArrowForwardRoundedIcon />}
              >
                Create Datastore
              </Button>
            </Link>
          </Stack>
        </Card>
      )} */}

      <Stack
        direction={'column'}
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          mx: 'auto',
        }}
      >
        <Stack
          ref={scrollableRef}
          direction={'column'}
          sx={{
            height: '100%',
            maxHeight: '100%',
            overflowY: 'auto',
            display: 'flex',
            pb: 18,
            pt: 2,
          }}
        >
          <Stack
            direction={'column'}
            gap={2}
            sx={{
              maxWidth: '100%',
              width: '700px',
              mx: 'auto',
            }}
          >
            {state?.history.map((each, index) => (
              <Card
                key={index}
                variant={'outlined'}
                color={each.from === 'agent' ? 'primary' : 'neutral'}
                sx={{
                  mr: each.from === 'agent' ? 'auto' : 'none',
                  ml: each.from === 'human' ? 'auto' : 'none',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {each.message}
              </Card>
            ))}

            {state.loading && (
              <CircularProgress
                variant="soft"
                color="neutral"
                size="sm"
                sx={{ mx: 'auto', my: 2 }}
              />
            )}
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 'auto',
            left: 0,
            maxWidth: '100%',
            width: '100%',
            overflow: 'visible',
            background: 'none',
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            bottom: 4,
          }}
        >
          {/* <div className="w-full h-12 -translate-y-1/2 pointer-events-none backdrop-blur-lg"></div> */}
          <form
            style={{
              maxWidth: '100%',
              width: '700px',
            }}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <Input
              // disabled={!state.currentDatastoreId || state.loading}
              variant="outlined"
              endDecorator={
                <IconButton
                  type="submit"
                  disabled={!state.currentDatastoreId || state.loading}
                >
                  <SendRoundedIcon />
                </IconButton>
              }
              {...methods.register('query')}
            />
          </form>
        </Box>
      </Stack>
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {},
  };
};
